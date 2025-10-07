package com.sudhanshu30602.dynamic_ui_list.face


import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
import android.util.Base64
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import org.json.JSONArray
import org.json.JSONObject
import org.tensorflow.lite.Interpreter
import java.io.*
import java.lang.Exception
import java.net.HttpURLConnection
import java.net.URL
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import kotlin.concurrent.thread
import kotlin.math.sqrt

class FaceRecognizerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODEL_NAME = "face_embedding.tflite" // put in /android/app/src/main/assets/
        const val MODEL_INPUT_SIZE = 112 // adjust to your model
        const val EMBEDDING_SIZE = 128 // adjust to your model
        const val EMBEDDINGS_FILE = "embeddings.json"
        const val MATCH_THRESHOLD = 0.7f // tune this
    }

    private val detector by lazy {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_NONE)
            .setContourMode(FaceDetectorOptions.CONTOUR_MODE_NONE)
            .build()
        FaceDetection.getClient(options)
    }

    private val tflite: Interpreter by lazy {
        Interpreter(loadModelFile(MODEL_NAME))
    }

    override fun getName() = "FaceRecognizer"

    // Helper: download image from URL
    private fun downloadBitmap(urlStr: String): Bitmap? {
        try {
            val url = URL(urlStr)
            val conn = url.openConnection() as HttpURLConnection
            conn.connectTimeout = 10000
            conn.readTimeout = 10000
            conn.instanceFollowRedirects = true
            conn.doInput = true
            conn.connect()
            val input = conn.inputStream
            val bmp = BitmapFactory.decodeStream(input)
            input.close()
            conn.disconnect()
            return bmp
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    // Load TFLite model as MappedByteBuffer
    private fun loadModelFile(modelName: String): java.nio.MappedByteBuffer {
        val afd = reactContext.assets.openFd(modelName)
        val inputStream = FileInputStream(afd.fileDescriptor)
        val fc = inputStream.channel
        return fc.map(FileChannel.MapMode.READ_ONLY, afd.startOffset, afd.declaredLength)
    }

    // Convert face-cropped bitmap to ByteBuffer for model input (normalize as needed)
    private fun bitmapToInputBuffer(bitmap: Bitmap): ByteBuffer {
        val resized = Bitmap.createScaledBitmap(bitmap, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, true)
        val input = ByteBuffer.allocateDirect(4 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3)
        input.order(ByteOrder.nativeOrder())
        val intValues = IntArray(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE)
        resized.getPixels(intValues, 0, MODEL_INPUT_SIZE, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE)
        // Example normalization: scale to [-1,1]
        for (pixel in intValues) {
            val r = ((pixel shr 16) and 0xFF) / 255.0f
            val g = ((pixel shr 8) and 0xFF) / 255.0f
            val b = (pixel and 0xFF) / 255.0f
            input.putFloat((r - 0.5f) * 2.0f)
            input.putFloat((g - 0.5f) * 2.0f)
            input.putFloat((b - 0.5f) * 2.0f)
        }
        input.rewind()
        return input
    }

    // Run TFLite and get embedding
    private fun runEmbedding(bitmap: Bitmap): FloatArray {
        val input = bitmapToInputBuffer(bitmap)
        val output = Array(1) { FloatArray(EMBEDDING_SIZE) }
        tflite.run(input, output)
        return l2Normalize(output[0])
    }

    // L2 normalize embedding
    private fun l2Normalize(vec: FloatArray): FloatArray {
        var sum = 0.0f
        for (v in vec) sum += v * v
        val norm = sqrt(sum.toDouble()).toFloat().coerceAtLeast(1e-10f)
        return FloatArray(vec.size) { i -> vec[i] / norm }
    }

    // Save embedding to file (JSON: { personId: [ [embedding], [embedding], ... ] })
    @Synchronized
    private fun saveEmbedding(personId: String, embedding: FloatArray) {
        val file = File(reactContext.filesDir, EMBEDDINGS_FILE)
        val root = if (file.exists()) JSONObject(file.readText()) else JSONObject()
        val arr = JSONArray()
        for (v in embedding) arr.put(v.toDouble())
        val personArr = if (root.has(personId)) root.getJSONArray(personId) else JSONArray()
        personArr.put(arr)
        root.put(personId, personArr)
        file.writeText(root.toString())
    }

    // Load all embeddings
    private fun loadAllEmbeddings(): Map<String, List<FloatArray>> {
        val file = File(reactContext.filesDir, EMBEDDINGS_FILE)
        val map = mutableMapOf<String, MutableList<FloatArray>>()
        if (!file.exists()) return map
        val root = JSONObject(file.readText())
        val keys = root.keys()
        while (keys.hasNext()) {
            val pid = keys.next()
            val personArr = root.getJSONArray(pid)
            val list = mutableListOf<FloatArray>()
            for (i in 0 until personArr.length()) {
                val arr = personArr.getJSONArray(i)
                val fa = FloatArray(arr.length())
                for (j in 0 until arr.length()) fa[j] = (arr.getDouble(j)).toFloat()
                list.add(fa)
            }
            map[pid] = list
        }
        return map
    }

    // Cosine similarity
    private fun cosine(a: FloatArray, b: FloatArray): Float {
        var dot = 0f; var na = 0f; var nb = 0f
        for (i in a.indices) {
            dot += a[i] * b[i]
            na += a[i] * a[i]
            nb += b[i] * b[i]
        }
        val denom = sqrt(na.toDouble()) * sqrt(nb.toDouble())
        return if (denom == 0.0) 0f else (dot / denom).toFloat()
    }

    // Crop a bitmap using bounding box (with clamp)
    private fun cropBitmapSafe(src: Bitmap, r: Rect): Bitmap {
        val left = r.left.coerceAtLeast(0)
        val top = r.top.coerceAtLeast(0)
        val right = r.right.coerceAtMost(src.width)
        val bottom = r.bottom.coerceAtMost(src.height)
        return Bitmap.createBitmap(src, left, top, right - left, bottom - top)
    }

    // Public method to add an image URL -> detect face -> store embedding linked to personId
    @ReactMethod
    fun addFaceFromUrl(imageUrl: String, personId: String, promise: Promise) {
        thread {
            try {
                val bmp = downloadBitmap(imageUrl)
                if (bmp == null) {
                    promise.reject("ERR_DOWNLOAD", "Failed to download image")
                    return@thread
                }
                val image = InputImage.fromBitmap(bmp, 0)
                detector.process(image)
                    .addOnSuccessListener { faces ->
                        if (faces.isEmpty()) {
                            promise.reject("ERR_NO_FACE", "No face detected")
                            return@addOnSuccessListener
                        }
                        val face = faces[0] // take first face
                        val crop = cropBitmapSafe(bmp, face.boundingBox)
                        val embedding = runEmbedding(crop)
                        saveEmbedding(personId, embedding)
                        promise.resolve("OK")
                    }
                    .addOnFailureListener { e ->
                        promise.reject("ERR_ML", e)
                    }
            } catch (e: Exception) {
                promise.reject("ERR", e)
            }
        }
    }

    // Recognize an image URL (download -> detect -> embed -> compare)
    @ReactMethod
    fun recognizeFromUrl(imageUrl: String, promise: Promise) {
        thread {
            try {
                val bmp = downloadBitmap(imageUrl)
                if (bmp == null) {
                    promise.reject("ERR_DOWNLOAD", "Failed to download image")
                    return@thread
                }
                val image = InputImage.fromBitmap(bmp, 0)
                detector.process(image)
                    .addOnSuccessListener { faces ->
                        if (faces.isEmpty()) {
                            promise.reject("ERR_NO_FACE", "No face detected")
                            return@addOnSuccessListener
                        }
                        val face = faces[0]
                        val crop = cropBitmapSafe(bmp, face.boundingBox)
                        val probe = runEmbedding(crop)

                        val db = loadAllEmbeddings()
                        var bestId: String? = null
                        var bestScore = -1f
                        for ((pid, list) in db) {
                            for (emb in list) {
                                val sim = cosine(probe, emb)
                                if (sim > bestScore) {
                                    bestScore = sim
                                    bestId = pid
                                }
                            }
                        }
                        if (bestId != null && bestScore >= MATCH_THRESHOLD) {
                            val res = Arguments.createMap()
                            res.putString("personId", bestId)
                            res.putDouble("score", bestScore.toDouble())
                            promise.resolve(res)
                        } else {
                            val res = Arguments.createMap()
                            res.putString("personId", "unknown")
                            res.putDouble("score", bestScore.toDouble())
                            promise.resolve(res)
                        }
                    }
                    .addOnFailureListener { e ->
                        promise.reject("ERR_ML", e)
                    }
            } catch (e: Exception) {
                promise.reject("ERR", e)
            }
        }
    }
}

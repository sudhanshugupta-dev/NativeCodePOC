package com.sudhanshu30602.dynamic_ui_list.face

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.google.mlkit.vision.face.FaceLandmark
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread
import kotlin.math.sqrt

class FaceRecognizerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MATCH_THRESHOLD = 0.7f // Similarity threshold for "success" (tune as needed)
    }

    private val detector by lazy {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL) // Enable landmarks for comparison
            .setContourMode(FaceDetectorOptions.CONTOUR_MODE_NONE)
            .build()
        FaceDetection.getClient(options)
    }

    override fun getName() = "FaceRecognizer"

    // Load bitmap from Cloudinary URL
    private fun loadBitmapFromUrl(urlStr: String): Bitmap? {
        try {
            val url = URL(urlStr)
            val conn = url.openConnection() as HttpURLConnection
            conn.connectTimeout = 10000
            conn.readTimeout = 10000
            conn.doInput = true
            conn.connect()
            val input = conn.inputStream
            val bmp = BitmapFactory.decodeStream(input)
            input.close()
            conn.disconnect()
            return bmp
        } catch (e: Exception) {
            Log.e("FaceRecognizer", "Failed to load URL bitmap: ${e.message}")
            return null
        }
    }

    // Load bitmap from local URI (e.g., file:///path/to/image.jpg)
    private fun loadBitmapFromUri(uriStr: String): Bitmap? {
        try {
            val uri = Uri.parse(uriStr)
            return BitmapFactory.decodeFile(uri.path)
        } catch (e: Exception) {
            Log.e("FaceRecognizer", "Failed to load local bitmap: ${e.message}")
            return null
        }
    }

    // Calculate Euclidean distance between two points
    private fun distance(x1: Float, y1: Float, x2: Float, y2: Float): Float {
        return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
    }

    // Compare faces using landmark distances (heuristic)
    private fun compareFacesByLandmarks(
        storedLandmarks: List<FaceLandmark>,
        capturedLandmarks: List<FaceLandmark>,
        storedBox: Rect,
        capturedBox: Rect
    ): Float {
        // Use key landmarks: left eye, right eye, nose
        val landmarks = listOf(
            FaceLandmark.LEFT_EYE,
            FaceLandmark.RIGHT_EYE,
            FaceLandmark.NOSE_BASE
        )

        // Collect positions
        val storedPoints = mutableListOf<Pair<Float, Float>>()
        val capturedPoints = mutableListOf<Pair<Float, Float>>()
        for (id in landmarks) {
            val storedLandmark = storedLandmarks.find { it.landmarkType == id }
            val capturedLandmark = capturedLandmarks.find { it.landmarkType == id }
            if (storedLandmark == null || capturedLandmark == null) return 0f
            storedPoints.add(Pair(storedLandmark.position.x, storedLandmark.position.y))
            capturedPoints.add(Pair(capturedLandmark.position.x, capturedLandmark.position.y))
        }

        // Normalize distances by bounding box size (to account for image scale)
        val storedBoxSize = sqrt((storedBox.width() * storedBox.height()).toFloat())
        val capturedBoxSize = sqrt((capturedBox.width() * capturedBox.height()).toFloat())
        val avgBoxSize = (storedBoxSize + capturedBoxSize) / 2f

        // Compute total normalized distance
        var totalDistance = 0f
        for (i in storedPoints.indices) {
            totalDistance += distance(
                storedPoints[i].first, storedPoints[i].second,
                capturedPoints[i].first, capturedPoints[i].second
            )
        }
        totalDistance /= avgBoxSize // Normalize by average box size

        // Convert distance to similarity (lower distance = higher similarity)
        // Arbitrary scaling: similarity = 1 / (1 + distance)
        val similarity = 1f / (1f + totalDistance)
        return similarity.coerceIn(0f, 1f)
    }

    // Compare faces: stored image (Cloudinary URL) vs captured image (local URI)
    @ReactMethod
    fun compareFaces(storedUrl: String, capturedUri: String, promise: Promise) {
        thread {
            try {
                // Load images
                val storedBitmap = loadBitmapFromUrl(storedUrl)
                if (storedBitmap == null) {
                    promise.reject("ERR_LOAD_STORED", "Failed to load stored image from URL")
                    return@thread
                }
                val capturedBitmap = loadBitmapFromUri(capturedUri)
                if (capturedBitmap == null) {
                    promise.reject("ERR_LOAD_CAPTURED", "Failed to load captured image")
                    return@thread
                }

                // Process stored image
                val storedImage = InputImage.fromBitmap(storedBitmap, 0)
                detector.process(storedImage)
                    .addOnSuccessListener { storedFaces ->
                        if (storedFaces.isEmpty()) {
                            promise.reject("ERR_NO_FACE_STORED", "No face detected in stored image")
                            return@addOnSuccessListener
                        }
                        val storedFace = storedFaces[0] // Use first face

                        // Process captured image
                        val capturedImage = InputImage.fromBitmap(capturedBitmap, 0)
                        detector.process(capturedImage)
                            .addOnSuccessListener { capturedFaces ->
                                if (capturedFaces.isEmpty()) {
                                    promise.reject("ERR_NO_FACE_CAPTURED", "No face detected in captured image")
                                    return@addOnSuccessListener
                                }
                                val capturedFace = capturedFaces[0] // Use first face

                                // Compare using landmarks
                                val similarity = compareFacesByLandmarks(
                                    storedFace.allLandmarks,
                                    capturedFace.allLandmarks,
                                    storedFace.boundingBox,
                                    capturedFace.boundingBox
                                )
                                val percentage = (similarity * 100).toDouble()
                                val isSuccess = similarity >= MATCH_THRESHOLD

                                // Return result
                                val response = Arguments.createMap().apply {
                                    putBoolean("success", isSuccess)
                                    putDouble("percentage", percentage)
                                }
                                promise.resolve(response)
                            }
                            .addOnFailureListener { e ->
                                promise.reject("ERR_DETECT_CAPTURED", "Face detection failed for captured image: ${e.message}")
                            }
                    }
                    .addOnFailureListener { e ->
                        promise.reject("ERR_DETECT_STORED", "Face detection failed for stored image: ${e.message}")
                    }
            } catch (e: Exception) {
                promise.reject("ERR_GENERAL", "Unexpected error: ${e.message}")
            }
        }
    }
}
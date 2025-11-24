package com.sudhanshu30602.dynamic_ui_list.battery

import android.content.Context
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.app.ActivityManager
import com.facebook.react.bridge.*

class DeviceInfoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext

    override fun getName(): String = "DeviceInfoModule"

    // 🔋 Get Battery Info
    @ReactMethod
    fun getBatteryInfo(promise: Promise) {
        try {
            val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            val status = if (bm.isCharging) "Charging" else "Not Charging"
            
            // Get temperature using BroadcastReceiver approach for better compatibility
            val batteryIntent = context.registerReceiver(null, 
                android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED))
            val temp = batteryIntent?.getIntExtra(android.os.BatteryManager.EXTRA_TEMPERATURE, 0)?.div(10.0) ?: 0.0

            val map = Arguments.createMap().apply {
                putInt("level", level)
                putString("status", status)
                putDouble("temperature", temp)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("BATTERY_ERROR", e)
        }
    }

    // 💾 Get Storage Info
    @ReactMethod
    fun getStorageInfo(promise: Promise) {
        try {
            val stat = StatFs(Environment.getDataDirectory().path)
            val total = stat.blockCountLong * stat.blockSizeLong
            val available = stat.availableBlocksLong * stat.blockSizeLong
            val used = total - available

            val map = Arguments.createMap().apply {
                putDouble("total", total.toDouble())
                putDouble("used", used.toDouble())
                putDouble("free", available.toDouble())
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STORAGE_ERROR", e)
        }
    }

    // 🧠 Get Memory Info
    @ReactMethod
    fun getMemoryInfo(promise: Promise) {
        try {
            val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val mi = ActivityManager.MemoryInfo()
            am.getMemoryInfo(mi)

            val map = Arguments.createMap().apply {
                putDouble("total", mi.totalMem.toDouble())
                putDouble("available", mi.availMem.toDouble())
                putBoolean("lowMemory", mi.lowMemory)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("MEMORY_ERROR", e)
        }
    }

    // 📱 Get Device Info
    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        try {
            val map = Arguments.createMap().apply {
                putString("brand", Build.BRAND)
                putString("manufacturer", Build.MANUFACTURER)
                putString("model", Build.MODEL)
                putString("hardware", Build.HARDWARE)
                putString("product", Build.PRODUCT)
                putString("version", Build.VERSION.RELEASE)
                putInt("apiLevel", Build.VERSION.SDK_INT)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("DEVICE_INFO_ERROR", e)
        }
    }
}

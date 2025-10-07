package com.sudhanshu30602.dynamic_ui_list.battery

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BatteryModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var receiver: BroadcastReceiver? = null

  override fun getName(): String = "BatteryModule"

  override fun initialize() {
    super.initialize()
    registerBatteryReceiver()
  }

  override fun onCatalystInstanceDestroy() {
    unregisterBatteryReceiver()
    super.onCatalystInstanceDestroy()
  }

  private fun registerBatteryReceiver() {
    if (receiver != null) return
    receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        intent ?: return
        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        val percent = if (level >= 0 && scale > 0) (level * 100 / scale) else -1

        val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
        val health = intent.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
        val temp = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1) // tenths °C
        val temperature = if (temp != -1) temp.toDouble() / 10.0 else null
        val plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)

        val map = Arguments.createMap()
        map.putInt("level", percent)
        map.putInt("status", status)
        map.putInt("health", health)
        temperature?.let { map.putDouble("temperature", it) } ?: map.putNull("temperature")
        map.putInt("plugged", plugged)

        sendEvent("BatteryUpdated", map)
      }
    }
    val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    reactContext.registerReceiver(receiver, filter)
  }

  private fun unregisterBatteryReceiver() {
    receiver?.let {
      try { reactContext.unregisterReceiver(it) } catch (e: Exception) {}
      receiver = null
    }
  }

  private fun sendEvent(eventName: String, params: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod
  fun getBatteryInfo(promise: Promise) {
    val intent = reactContext.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    if (intent == null) {
      promise.reject("NO_INTENT", "Battery intent unavailable")
      return
    }
    val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
    val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
    val percent = if (level >= 0 && scale > 0) (level * 100 / scale) else -1
    val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
    val health = intent.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
    val temp = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)
    val temperature = if (temp != -1) temp.toDouble() / 10.0 else -1.0
    val plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)

    val map = Arguments.createMap()
    map.putInt("level", percent)
    map.putInt("status", status)
    map.putInt("health", health)
    map.putDouble("temperature", temperature)
    map.putInt("plugged", plugged)

    promise.resolve(map)
  }
}

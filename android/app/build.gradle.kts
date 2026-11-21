// The THOKAR চান্স NAI Android app: a full-screen WebView around the live site, with its own splash,
// loading animation and offline screen. Signed outside GitHub (see README, "Android app").
plugins { id("com.android.application") }

android {
    namespace = "com.thokarchancenai.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "app.vercel.thokar_chance_nai"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1"
    }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}

dependencies {
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
}

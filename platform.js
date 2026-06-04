(() => {
  const platform = {
    name: "web",
    supportsTilt: "DeviceOrientationEvent" in window,
    isSecureContext: window.isSecureContext,
    adDelayMs: 1000,
    async showRewardedAd(placement = "rewarded", button = null) {
      const originalText = button ? button.textContent : "";
      if (button) {
        button.disabled = true;
        button.dataset.originalText = originalText;
        button.textContent = "广告播放中...";
      }
      await new Promise((resolve) => window.setTimeout(resolve, platform.adDelayMs));
      if (button) {
        button.disabled = false;
        button.textContent = button.dataset.originalText || originalText;
        delete button.dataset.originalText;
      }
      return { ok: true, placement, mocked: true };
    },
    getEnvironmentHint() {
      if (location.protocol === "file:") {
        return "建议用 python -m http.server 8000 启动，避免浏览器限制素材加载。";
      }
      return `${location.protocol}//${location.host || "localhost"} 静态运行中`;
    },
  };

  window.BeerPlatform = platform;
})();

"use client";

import { useEffect } from "react";
import LearnerAppPilotV2 from "@/components/LearnerAppPilotV2";

function hideDuplicateContentBranding() {
  const roots = document.querySelectorAll(".pilot-v3 .flex-1 img[alt='차바이오그룹 CI']");
  roots.forEach((image) => {
    const wrapper = image.parentElement;
    if (wrapper instanceof HTMLElement) {
      wrapper.style.display = "none";
    }
  });
}

function scrollContentToTop() {
  const scrollArea = document.querySelector(".pilot-v3 .flex-1.overflow-y-auto");
  if (scrollArea instanceof HTMLElement) {
    scrollArea.scrollTo({ top: 0, behavior: "auto" });
  }
}

export default function LearnerAppPilotV3() {
  useEffect(() => {
    hideDuplicateContentBranding();
    scrollContentToTop();

    const observer = new MutationObserver(() => {
      hideDuplicateContentBranding();
      requestAnimationFrame(scrollContentToTop);
    });

    const appRoot = document.querySelector(".pilot-v3");
    if (appRoot) {
      observer.observe(appRoot, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="pilot-v3">
      <LearnerAppPilotV2 />
    </div>
  );
}

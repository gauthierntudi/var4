declare module "page-flip" {
  export type PageFlipSettings = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    startPage?: number;
  };

  export type PageFlipOrientation = "portrait" | "landscape";

  export type PageFlipEvent<T = unknown> = {
    data: T;
    object: PageFlip;
  };

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    loadFromImages(images: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    update(): void;
    destroy(): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(page: number, corner?: "top" | "bottom"): void;
    turnToPage(page: number): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): PageFlipOrientation;
    on(event: "flip", cb: (e: PageFlipEvent<number>) => void): PageFlip;
    on(event: "changeOrientation", cb: (e: PageFlipEvent<PageFlipOrientation>) => void): PageFlip;
    on(event: "changeState" | "init" | "update", cb: (e: PageFlipEvent) => void): PageFlip;
    off(event: string): void;
  }
}

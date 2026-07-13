import React, {Component} from "react";
import "./ManuscriptViewer.css";

function thumbPath(img_path) {
    const slash = img_path.lastIndexOf("/");
    return img_path.slice(0, slash + 1) + "thumbnails/thumb_" + img_path.slice(slash + 1);
}

class ManuscriptViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "currentIndex": 0,
            "lightboxOpen": false,
            "zoomLevel": 1,
        };
        this.closeLightbox = this.closeLightbox.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
        // ref to the lightbox close button, focused when the lightbox opens
        this.closeButtonRef = React.createRef();
        // ref to the trigger that opened the lightbox, refocused when it closes
        this.openTriggerRef = React.createRef();
    }

    openLightbox() {
        this.setState({"lightboxOpen": true, "zoomLevel": 1}, () => {
            if (this.closeButtonRef.current) {
                this.closeButtonRef.current.focus();
            }
        });
    }

    closeLightboxAndRestoreFocus() {
        this.setState({"lightboxOpen": false, "zoomLevel": 1}, () => {
            if (this.openTriggerRef.current) {
                this.openTriggerRef.current.focus();
            }
        });
    }

    closeLightbox(e) {
        if (e.type === "keydown" && e.key !== "Escape") return;
        if (!this.state.lightboxOpen) return;
        this.closeLightboxAndRestoreFocus();
    }

    handleBackdropClick() {
        if (this.state.zoomLevel > 1) {
            this.setState({"zoomLevel": 1});
        } else {
            this.closeLightboxAndRestoreFocus();
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.25 : 0.25;
        const newZoom = Math.max(1, Math.min(5, this.state.zoomLevel + delta));
        this.setState({"zoomLevel": newZoom});
    }

    componentDidMount() {
        document.addEventListener("keydown", this.closeLightbox);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.closeLightbox);
    }

    render() {
        const {images} = this.props;

        if (!images || images.length === 0) {
            return (
                <div className="callout alert ms-no-images">
                    <h6>No manuscript images for this story.</h6>
                </div>
            );
        }

        const {currentIndex, lightboxOpen, zoomLevel} = this.state;
        const base = process.env.PUBLIC_URL;
        const current = images[currentIndex];
        const mainSrc = `${base}/${current.img_path}`;

        return (
            <div className="ManuscriptViewer">
                {/* Lightbox overlay */}
                {lightboxOpen && (
                    <div
                        className="ms-lightbox"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Manuscript page ${current.seq}, enlarged view`}
                        onClick={this.handleBackdropClick}
                        onWheel={this.handleWheel}
                        onKeyDown={e => {
                            // keep focus inside the lightbox while it's open (simple trap: only
                            // 2-3 focusable elements, so wrap Tab/Shift+Tab between first and last)
                            if (e.key !== "Tab") return;
                            const focusable = e.currentTarget.querySelectorAll("button:not(:disabled)");
                            if (focusable.length === 0) return;
                            const first = focusable[0];
                            const last = focusable[focusable.length - 1];
                            if (e.shiftKey && document.activeElement === first) {
                                e.preventDefault();
                                last.focus();
                            } else if (!e.shiftKey && document.activeElement === last) {
                                e.preventDefault();
                                first.focus();
                            }
                        }}>
                        <button
                            ref={this.closeButtonRef}
                            className="ms-lightbox-close"
                            aria-label="Close enlarged view"
                            onClick={e => { e.stopPropagation(); this.closeLightboxAndRestoreFocus(); }}>✕</button>
                        {zoomLevel > 1 && (
                            <div className="ms-lightbox-hint">Scroll to zoom · click backdrop to reset</div>
                        )}
                        <img
                            src={mainSrc}
                            alt={`Manuscript page ${current.seq}`}
                            style={{transform: `scale(${zoomLevel})`, transformOrigin: "center", cursor: zoomLevel < 5 ? "zoom-in" : "zoom-out"}}
                            onClick={e => { e.stopPropagation(); const next = zoomLevel >= 4 ? 1 : zoomLevel + 1; this.setState({"zoomLevel": next}); }} />
                        {images.length > 1 && (
                            <div className="ms-lightbox-nav">
                                <button
                                    disabled={currentIndex === 0}
                                    onClick={e => { e.stopPropagation(); this.setState({"currentIndex": currentIndex - 1, "zoomLevel": 1}); }}>
                                    ‹ Prev
                                </button>
                                <span>{currentIndex + 1} / {images.length}</span>
                                <button
                                    disabled={currentIndex === images.length - 1}
                                    onClick={e => { e.stopPropagation(); this.setState({"currentIndex": currentIndex + 1, "zoomLevel": 1}); }}>
                                    Next ›
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main image */}
                <div className="ms-main-image" title="Click to enlarge">
                    <button
                        ref={this.openTriggerRef}
                        type="button"
                        className="ms-main-image-btn"
                        aria-label={`Enlarge manuscript page ${current.seq}`}
                        onClick={() => this.openLightbox()}>
                        <img
                            src={mainSrc}
                            alt={`Manuscript page ${current.seq}`} />
                    </button>
                </div>

                {/* Caption + prev/next */}
                <div className="ms-caption">
                    Page {currentIndex + 1} of {images.length}
                    {images.length > 1 && (
                        <span>
                            <button
                                className="ms-nav-btn"
                                aria-label="Previous page"
                                disabled={currentIndex === 0}
                                onClick={() => this.setState({"currentIndex": currentIndex - 1})}>
                                ‹
                            </button>
                            <button
                                className="ms-nav-btn"
                                aria-label="Next page"
                                disabled={currentIndex === images.length - 1}
                                onClick={() => this.setState({"currentIndex": currentIndex + 1})}>
                                ›
                            </button>
                        </span>
                    )}
                </div>

                {/* Thumbnail strip — only shown when there are multiple pages */}
                {images.length > 1 && (
                    <div className="ms-thumbnails">
                        {images.map((img, i) => (
                            <button
                                type="button"
                                key={i}
                                className={`ms-thumb-btn ${i === currentIndex ? "ms-thumb-active" : ""}`}
                                aria-label={`Go to page ${img.seq}`}
                                aria-current={i === currentIndex}
                                onClick={() => this.setState({"currentIndex": i})}>
                                <img
                                    src={`${base}/${thumbPath(img.img_path)}`}
                                    alt=""
                                    className="ms-thumb" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default ManuscriptViewer;

import React, {Component} from "react";
import "./ManuscriptViewer.css";

function thumbPath(img_path) {
    // "manuscript_images/B1000303.gif" → "manuscript_images/thumbnails/thumb_B1000303.gif"
    const slash = img_path.lastIndexOf("/");
    return img_path.slice(0, slash + 1) + "thumbnails/thumb_" + img_path.slice(slash + 1);
}

class ManuscriptViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "currentIndex": 0,
            "lightboxOpen": false,
        };
        this.closeLightbox = this.closeLightbox.bind(this);
    }

    closeLightbox(e) {
        // close on backdrop click or Escape key
        if (e.type === "keydown" && e.key !== "Escape") return;
        this.setState({"lightboxOpen": false});
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

        const {currentIndex, lightboxOpen} = this.state;
        const base = process.env.PUBLIC_URL;
        const current = images[currentIndex];
        const mainSrc = `${base}/${current.img_path}`;

        return (
            <div className="ManuscriptViewer">
                {/* Lightbox overlay */}
                {lightboxOpen && (
                    <div className="ms-lightbox" onClick={this.closeLightbox}>
                        <button className="ms-lightbox-close" onClick={this.closeLightbox}>✕</button>
                        <img
                            src={mainSrc}
                            alt={`Manuscript page ${current.seq}`}
                            onClick={e => e.stopPropagation()} />
                        {images.length > 1 && (
                            <div className="ms-lightbox-nav">
                                <button
                                    disabled={currentIndex === 0}
                                    onClick={e => { e.stopPropagation(); this.setState({"currentIndex": currentIndex - 1}); }}>
                                    ‹ Prev
                                </button>
                                <span>{currentIndex + 1} / {images.length}</span>
                                <button
                                    disabled={currentIndex === images.length - 1}
                                    onClick={e => { e.stopPropagation(); this.setState({"currentIndex": currentIndex + 1}); }}>
                                    Next ›
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main image */}
                <div className="ms-main-image" title="Click to enlarge">
                    <img
                        src={mainSrc}
                        alt={`Manuscript page ${current.seq}`}
                        onClick={() => this.setState({"lightboxOpen": true})} />
                </div>

                {/* Caption + prev/next */}
                <div className="ms-caption">
                    Page {currentIndex + 1} of {images.length}
                    {images.length > 1 && (
                        <span>
                            <button
                                className="ms-nav-btn"
                                disabled={currentIndex === 0}
                                onClick={() => this.setState({"currentIndex": currentIndex - 1})}>
                                ‹
                            </button>
                            <button
                                className="ms-nav-btn"
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
                            <img
                                key={i}
                                src={`${base}/${thumbPath(img.img_path)}`}
                                alt={`Page ${img.seq}`}
                                className={`ms-thumb ${i === currentIndex ? "ms-thumb-active" : ""}`}
                                onClick={() => this.setState({"currentIndex": i})} />
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default ManuscriptViewer;

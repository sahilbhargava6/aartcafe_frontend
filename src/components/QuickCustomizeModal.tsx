"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { X, Check, Upload, Sparkles, AlertCircle } from "lucide-react";

type Option = {
  id?: number;
  value: string;
  price_modifier?: string | number;
  image?: string | null;
  links?: { value: string; attribute?: { name: string } }[];
};

type Attribute = {
  id?: number;
  name: string;
  type?: string;
  values?: Option[];
};

type Selections = { [key: string]: { value: string; modifier: number } };

interface QuickCustomizeModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const isRealOption = (v: Option) =>
  !!v.value && !["na", "n/a", "none", "-", "null", ""].includes(v.value.toString().trim().toLowerCase());

const isMultiChoice = (attr: Attribute) => attr.type === "checkbox";
const splitChoice = (choice?: string) => (choice ? choice.split(", ").map((s) => s.trim()).filter(Boolean) : []);
const findOption = (attr: Attribute, value: string) => (attr.values || []).find((v) => v.value === value);

const choiceOf = (attr: Attribute, values: string[]) => ({
  value: values.join(", "),
  modifier: values.reduce((sum, v) => sum + (Number(findOption(attr, v)?.price_modifier) || 0), 0),
});

const linkedTo = (value: Option, attrName: string): string[] =>
  (value.links || []).filter((l) => l.attribute?.name === attrName).map((l) => l.value);

const pairFits = (attrA: Attribute, a: Option, attrB: Attribute, b: Option) => {
  const aAllows = linkedTo(a, attrB.name);
  const bAllows = linkedTo(b, attrA.name);
  return (!aAllows.length || aAllows.includes(b.value)) && (!bAllows.length || bAllows.includes(a.value));
};

const fitsSelection = (attributes: Attribute[], attr: Attribute, value: Option, selected: Selections) =>
  attributes.every(
    (other) =>
      other.name === attr.name ||
      other.type === "text" ||
      splitChoice(selected[other.name]?.value).every((picked) => {
        const pickedValue = findOption(other, picked);
        return !pickedValue || pairFits(attr, value, other, pickedValue);
      })
  );

const fitsAbove = (attributes: Attribute[], index: number, value: Option, selected: Selections) =>
  fitsSelection(attributes.slice(0, index), attributes[index], value, selected);

const firstFittingAbove = (attributes: Attribute[], index: number, selected: Selections) =>
  (attributes[index].values || []).filter(isRealOption).find((v) => fitsAbove(attributes, index, v, selected));

const cascadeBelow = (attributes: Attribute[], index: number, selected: Selections) => {
  const updated = { ...selected };
  for (let i = index + 1; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.type === "text") continue;
    const kept = splitChoice(updated[attr.name]?.value).filter((picked) => {
      const option = findOption(attr, picked);
      return !!option && fitsAbove(attributes, i, option, updated);
    });
    if (!kept.length && !isMultiChoice(attr)) {
      const first = firstFittingAbove(attributes, i, updated);
      if (first) kept.push(first.value);
    }
    updated[attr.name] = choiceOf(attr, kept);
  }
  return updated;
};

const initialSelections = (attributes: Attribute[]): Selections => {
  const selected: Selections = {};
  attributes.forEach((attr, index) => {
    const first = attr.type === "text" ? attr.values?.[0] : firstFittingAbove(attributes, index, selected);
    if (first) selected[attr.name] = choiceOf(attr, [first.value]);
  });
  return selected;
};

const extractGallery = (product: any): string[] => {
  if (!product) return [];
  const list: string[] = [];

  if (product.image && typeof product.image === "string") {
    const trimmed = product.image.trim();
    if (trimmed && !trimmed.startsWith("[")) list.push(trimmed);
  }

  let extra = product.images;
  if (typeof extra === "string") {
    try {
      extra = JSON.parse(extra);
    } catch {
      if (extra.includes(",")) extra = extra.split(",").map((s: string) => s.trim());
      else if (extra && !extra.startsWith("[")) extra = [extra];
    }
  }

  if (Array.isArray(extra)) {
    extra.forEach((img: any) => {
      if (typeof img === "string" && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    });
  }

  return list.filter(Boolean);
};

export default function QuickCustomizeModal({ product, isOpen, onClose }: QuickCustomizeModalProps) {
  const { addToBag, openCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState<Selections>({});
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attributes: Attribute[] = React.useMemo(() => {
    if (!product || !Array.isArray(product.attributes)) return [];
    return product.attributes;
  }, [product]);

  const gallery = React.useMemo(() => extractGallery(product), [product]);

  // Reset & initialize state when product changes or opens
  useEffect(() => {
    if (isOpen && product) {
      const initial = initialSelections(attributes);
      setSelectedAttributes(initial);
      setSelectedImage(gallery[0] || product.image || "");
      setUploadedImage(null);
      setCustomNote("");
    }
  }, [isOpen, product, attributes, gallery]);

  if (!isOpen || !product) return null;

  // Base and sale price
  const basePrice = Number(product.basePrice ?? product.base_price ?? product.price ?? 0);
  const discountPrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? Number(product.discountPrice)
      : product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const startingPrice = discountPrice !== null && discountPrice < basePrice ? discountPrice : basePrice;

  // Total attribute modifier sum
  const totalModifier = Object.values(selectedAttributes).reduce((sum, item) => sum + (item.modifier || 0), 0);
  const finalPrice = Math.round(startingPrice + totalModifier);
  const originalStrikethrough = discountPrice !== null && discountPrice < basePrice ? Math.round(basePrice + totalModifier) : null;

  const handleOptionSelect = (attrIndex: number, attr: Attribute, value: string) => {
    let next: Selections = { ...selectedAttributes };

    if (isMultiChoice(attr)) {
      const current = splitChoice(next[attr.name]?.value);
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      next[attr.name] = choiceOf(attr, updated);
    } else {
      next[attr.name] = choiceOf(attr, [value]);
    }

    next = cascadeBelow(attributes, attrIndex, next);
    setSelectedAttributes(next);

    // If option has an image linked, switch preview image
    const chosenOpt = findOption(attr, value);
    if (chosenOpt?.image && gallery.includes(chosenOpt.image)) {
      setSelectedImage(chosenOpt.image);
      setUploadedImage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setUploadedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAdd = () => {
    // Generate attribute summary e.g. "Size: 10", Border: Pinewood"
    const attrSummary = Object.entries(selectedAttributes)
      .map(([k, v]) => `${v.value}`)
      .filter(Boolean)
      .join(", ");

    const optionIds: number[] = [];
    attributes.forEach((attr) => {
      const chosen = selectedAttributes[attr.name]?.value?.split(", ") || [];
      (attr.values || []).forEach((v) => {
        if (chosen.includes(v.value) && v.id) optionIds.push(v.id);
      });
    });

    const selectedOptionsList: { name: string; value: string }[] = [];
    attributes.forEach((attr) => {
      const val = selectedAttributes[attr.name]?.value;
      if (val) {
        selectedOptionsList.push({ name: attr.name, value: val });
      }
    });

    if (customNote.trim()) {
      selectedOptionsList.push({ name: "Custom Request", value: customNote.trim() });
    }

    const finalPhoto = uploadedImage || selectedImage || product.image || "";

    addToBag({
      id: `${product.id}-${Date.now()}`,
      title: `${product.title}${attrSummary ? ` (${attrSummary})` : ""}`,
      productTitle: product.title,
      price: finalPrice,
      image: finalPhoto,
      productId: product.id,
      optionIds,
      selectedOptions: selectedOptionsList,
      isFreeDelivery: Boolean(product.isFreeDelivery || product.is_free_delivery),
    });

    onClose();
    openCart();
  };

  return (
    <div className="quick-modal-backdrop" onClick={onClose}>
      <div
        className="quick-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-modal-title"
      >
        {/* Header Bar */}
        <div className="quick-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={16} color="#D9A85C" />
            <span className="font-serif quick-modal-header-title">Customize & Add to Bag</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="quick-modal-close-btn"
            aria-label="Close"
          >
            <X size={20} color="#3F3B38" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="quick-modal-body">
          {/* Top Product Summary */}
          <div className="quick-product-summary">
            <div className="quick-preview-image-wrapper">
              <img
                src={uploadedImage || selectedImage || product.image}
                alt={product.title}
                className="quick-preview-image"
              />
              {uploadedImage && (
                <span className="quick-custom-badge font-sans">Custom Upload</span>
              )}
            </div>

            <div className="quick-product-info">
              <h3 id="quick-modal-title" className="font-serif quick-product-title">
                {product.title}
              </h3>
              {product.category && (
                <span className="font-sans quick-product-cat">{product.category}</span>
              )}
              <div className="quick-price-row font-sans">
                <span className="quick-current-price">₹{finalPrice.toLocaleString()}</span>
                {originalStrikethrough && (
                  <span className="quick-original-price">₹{originalStrikethrough.toLocaleString()}</span>
                )}
                {product.isFreeDelivery && (
                  <span className="quick-free-delivery">Free Delivery</span>
                )}
              </div>
            </div>
          </div>

          {/* 1. Select Reference Image / Photo for the Order */}
          <div className="quick-section">
            <label className="quick-section-title font-sans">
              1. Choose Photo Design to Send in Order
            </label>
            <p className="quick-section-hint font-sans">
              Tap a photo to set it as the reference design for your handmade order:
            </p>

            <div className="quick-gallery-row">
              {gallery.map((imgUrl, i) => {
                const isSelected = !uploadedImage && selectedImage === imgUrl;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      setUploadedImage(null);
                    }}
                    className={`quick-gallery-thumb-btn${isSelected ? " is-selected" : ""}`}
                    aria-label={`Select photo ${i + 1}`}
                  >
                    <img src={imgUrl} alt={`Option ${i + 1}`} className="quick-gallery-thumb-img" />
                    {isSelected && (
                      <div className="quick-thumb-check">
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Upload Own Reference Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`quick-upload-btn${uploadedImage ? " is-uploaded" : ""}`}
                title="Upload custom reference image"
              >
                <Upload size={16} color={uploadedImage ? "#D9A85C" : "#6E6E6E"} />
                <span className="font-sans" style={{ fontSize: "11px", fontWeight: 500, color: uploadedImage ? "#8C5E1B" : "#6E6E6E" }}>
                  {uploadedImage ? "Change" : "Upload"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </button>
            </div>
          </div>

          {/* 2. Attributes (Size, Frame Type, etc.) */}
          {attributes.length > 0 && (
            <div className="quick-section">
              <label className="quick-section-title font-sans">
                2. Select Options & Attributes
              </label>

              <div className="quick-attributes-list">
                {attributes.map((attr, attrIdx) => {
                  const rawValues = (attr.values || []).filter(isRealOption);
                  const validOptions = rawValues.filter((v) => fitsAbove(attributes, attrIdx, v, selectedAttributes));
                  const selectedVal = selectedAttributes[attr.name]?.value || "";

                  if (validOptions.length === 0) return null;

                  return (
                    <div key={attr.name} className="quick-attribute-group">
                      <div className="quick-attr-header font-sans">
                        <span className="quick-attr-name">{attr.name}</span>
                        {selectedVal && <span className="quick-attr-selected-value">{selectedVal}</span>}
                      </div>

                      <div className="quick-attr-options-chips">
                        {validOptions.map((opt) => {
                          const isPicked = splitChoice(selectedVal).includes(opt.value);
                          const mod = Number(opt.price_modifier) || 0;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleOptionSelect(attrIdx, attr, opt.value)}
                              className={`quick-option-chip font-sans${isPicked ? " is-picked" : ""}`}
                            >
                              <span>{opt.value}</span>
                              {mod > 0 && <span className="quick-chip-mod">+{mod}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Optional Custom Request Note */}
          <div className="quick-section" style={{ borderBottom: "none", marginBottom: 0 }}>
            <label htmlFor="quick-custom-note" className="quick-section-title font-sans">
              3. Special Request / Name / Date (Optional)
            </label>
            <input
              id="quick-custom-note"
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Add name 'Rahul & Pooja', anniversary date, or color notes"
              className="quick-note-input font-sans"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="quick-modal-footer">
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="quick-confirm-btn font-sans"
          >
            <span>Confirm & Add to Bag</span>
            <span className="quick-confirm-price">₹{finalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .quick-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: quickFadeIn 0.2s ease-out;
        }

        .quick-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: quickScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0e6dc;
          background: #fffdfb;
        }

        .quick-modal-header-title {
          font-size: 19px;
          font-weight: 500;
          color: #3f3b38;
        }

        .quick-modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }

        .quick-modal-close-btn:hover {
          background: #f5ebe1;
        }

        .quick-modal-body {
          padding: 18px 20px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .quick-product-summary {
          display: flex;
          gap: 16px;
          align-items: center;
          background: #faf6f0;
          padding: 12px;
          border-radius: 14px;
        }

        .quick-preview-image-wrapper {
          position: relative;
          width: 76px;
          height: 76px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e7ded5;
        }

        .quick-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quick-custom-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(217, 168, 92, 0.95);
          color: #fff;
          font-size: 9px;
          text-align: center;
          padding: 2px 0;
          font-weight: 600;
        }

        .quick-product-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .quick-product-title {
          font-size: 17px;
          line-height: 22px;
          color: #3f3b38;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-product-cat {
          font-size: 12px;
          color: #8e8882;
        }

        .quick-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 4px;
        }

        .quick-current-price {
          font-size: 18px;
          font-weight: 700;
          color: #3f3b38;
        }

        .quick-original-price {
          font-size: 13px;
          color: #a89f91;
          text-decoration: line-through;
        }

        .quick-free-delivery {
          font-size: 11px;
          color: #3f7b58;
          font-weight: 600;
          background: #eaf5ee;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .quick-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f4ece4;
        }

        .quick-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #3f3b38;
        }

        .quick-section-hint {
          font-size: 12px;
          color: #8e8882;
          margin: 0;
        }

        .quick-gallery-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 2px 8px;
          scrollbar-width: none;
        }

        .quick-gallery-row::-webkit-scrollbar {
          display: none;
        }

        .quick-gallery-thumb-btn {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 10px;
          overflow: hidden;
          padding: 0;
          background: #fbf8f5;
          border: 2px solid #e7dfd6;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-gallery-thumb-btn.is-selected {
          border-color: #d9a85c;
          box-shadow: 0 0 0 2px rgba(217, 168, 92, 0.3);
          transform: translateY(-2px);
        }

        .quick-gallery-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quick-thumb-check {
          position: absolute;
          top: 3px;
          right: 3px;
          background: #d9a85c;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-upload-btn {
          width: 58px;
          height: 58px;
          border-radius: 10px;
          border: 1.5px dashed #d5c8bb;
          background: #faf6f2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .quick-upload-btn:hover {
          border-color: #d9a85c;
          background: #fcf8f3;
        }

        .quick-upload-btn.is-uploaded {
          border-color: #d9a85c;
          background: rgba(217, 168, 92, 0.12);
        }

        .quick-attributes-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .quick-attribute-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .quick-attr-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .quick-attr-name {
          font-weight: 500;
          color: #55504b;
        }

        .quick-attr-selected-value {
          color: #966822;
          font-weight: 600;
        }

        .quick-attr-options-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-option-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid #e2d7cc;
          background: #fff;
          color: #3f3b38;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .quick-option-chip:hover {
          border-color: #d9a85c;
        }

        .quick-option-chip.is-picked {
          background: #d9a85c;
          border-color: #d9a85c;
          color: #ffffff;
          font-weight: 500;
          box-shadow: 0 2px 6px rgba(217, 168, 92, 0.35);
        }

        .quick-chip-mod {
          font-size: 11px;
          opacity: 0.85;
        }

        .quick-note-input {
          width: 100%;
          border: 1px solid #e0d4c7;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 13px;
          color: #3f3b38;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .quick-note-input:focus {
          border-color: #d9a85c;
          box-shadow: 0 0 0 3px rgba(217, 168, 92, 0.12);
        }

        .quick-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #f0e6dc;
          background: #fffdfb;
        }

        .quick-confirm-btn {
          width: 100%;
          background: #3f3b38;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: 14px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(63, 59, 56, 0.2);
        }

        .quick-confirm-btn:hover {
          background: #2a2725;
          transform: translateY(-1px);
        }

        .quick-confirm-btn:active {
          transform: translateY(0);
        }

        .quick-confirm-price {
          background: rgba(255, 255, 255, 0.18);
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 14px;
        }

        @keyframes quickFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes quickScaleUp {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Mobile Bottom Sheet Drawer */
        @media (max-width: 600px) {
          .quick-modal-backdrop {
            align-items: flex-end;
            padding: 0;
          }

          .quick-modal-card {
            max-width: 100%;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            max-height: 85vh;
            animation: quickSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes quickSlideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
}

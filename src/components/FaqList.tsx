"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export type Faq = { question: string; answer: string };

// Addresses written in an answer ("www.aartcafe.com/track-order", "https://…") become links
function withLinks(text: string) {
  return text.split(/((?:https?:\/\/|www\.)[^\s,)]+[^\s,).])/g).map((part, i) => {
    if (!/^(https?:\/\/|www\.)/.test(part)) return part;
    const href = part.startsWith("www.aartcafe.com") ? part.slice("www.aartcafe.com".length) || "/" : part.startsWith("www.") ? `https://${part}` : part;
    return (
      <a key={i} href={href} style={{ color: "#D98A9C", textDecoration: "underline" }}>
        {part}
      </a>
    );
  });
}

// Questions as an accordion: tap a question to show its answer
export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="faq-list">
      {faqs.map((faq, i) => (
        <details key={i} className="faq-item" open={i === 0}>
          <summary className="faq-question font-serif">
            <span>{faq.question}</span>
            <ChevronDown size={20} className="faq-chevron" aria-hidden="true" />
          </summary>
          <p className="faq-answer font-sans">{withLinks(faq.answer)}</p>
        </details>
      ))}

      <style jsx>{`
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .faq-item {
          border: 1px solid #ebe5db;
          border-radius: 14px;
          background: #fff;
          transition: border-color 0.2s ease;
        }
        .faq-item[open] {
          border-color: #d9a85c;
        }
        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 56px;
          padding: 14px 20px;
          font-size: 20px;
          line-height: 28px;
          color: #3f3b38;
          cursor: pointer;
          list-style: none;
        }
        .faq-question::-webkit-details-marker {
          display: none;
        }
        .faq-question :global(.faq-chevron) {
          flex-shrink: 0;
          color: #d9a85c;
          transition: transform 0.2s ease;
        }
        .faq-item[open] .faq-question :global(.faq-chevron) {
          transform: rotate(180deg);
        }
        .faq-answer {
          margin: 0;
          padding: 0 20px 18px;
          font-size: 16px;
          line-height: 26px;
          color: #6e6e6e;
          white-space: pre-line;
        }
        @media (max-width: 600px) {
          .faq-question {
            font-size: 17px;
            line-height: 24px;
            padding: 12px 16px;
          }
          .faq-answer {
            padding: 0 16px 16px;
            font-size: 15px;
            line-height: 24px;
          }
        }
      `}</style>
    </div>
  );
}

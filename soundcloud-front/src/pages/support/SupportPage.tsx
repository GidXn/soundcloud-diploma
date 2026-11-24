import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getSupportPage, type SupportLine } from "./supportContent";
import "../../styles/support/support.css";

const QuoteIcon: React.FC = () => (
    <svg className="support_quote_icon" viewBox="0 0 40 32" aria-hidden="true">
        <path
            fill="currentColor"
            d="M0 32V19.2C0 15.6 .8 12.2 2.4 9 4 5.8 6.4 2.8 9.6 0l4.8 3.6C12.2 5.8 10.6 8 9.6 10.2 8.6 12.4 8.1 14.6 8 16.8h8V32H0Zm24 0V19.2c0-3.6.8-7 2.4-10.2C28 5.8 30.4 2.8 33.6 0l4.8 3.6c-2.2 2.2-3.8 4.4-4.8 6.6-1 2.2-1.5 4.4-1.6 6.6h8V32H24Z"
        />
    </svg>
);

const Email: React.FC<{ email: string }> = ({ email }) => (
    <a className="support_link" href={`mailto:${email}`}>{email}</a>
);

const renderLine = (line: SupportLine, i: number) => {
    if (typeof line === "string") {
        return <p key={i} className="support_line">{line}</p>;
    }
    return (
        <p key={i} className={`support_line${line.indent ? " support_line_indent" : ""}`}>
            {line.href ? <Link className="support_link_plain" to={line.href}>{line.text}</Link> : line.text}
            {line.email && <Email email={line.email} />}
        </p>
    );
};

const SupportPage: React.FC = () => {
    const { slug } = useParams();
    const page = getSupportPage(slug);

    useEffect(() => {
        document.querySelector(".content_container")?.scrollTo(0, 0);
        window.scrollTo(0, 0);
    }, [slug]);

    if (!page) {
        return (
            <div className="support_page">
                <h1 className="support_title">Page not found</h1>
                <p className="support_text">
                    <Link className="support_link" to="/home">Back to home</Link>
                </p>
            </div>
        );
    }

    return (
        <article className="support_page">
            <h1 className="support_title">{page.title}</h1>
            {page.blocks.map((block, i) => {
                if (block.type === "h") {
                    return <h2 key={i} className="support_heading">{block.text}</h2>;
                }
                if (block.type === "p") {
                    return (
                        <p key={i} className="support_text">
                            {block.text}
                            {block.email && <Email email={block.email} />}
                        </p>
                    );
                }
                return (
                    <section key={i} className={`support_card${block.highlight ? " support_card_highlight" : ""}`}>
                        <QuoteIcon />
                        <div className="support_card_body">{block.lines.map(renderLine)}</div>
                    </section>
                );
            })}
        </article>
    );
};

export default SupportPage;

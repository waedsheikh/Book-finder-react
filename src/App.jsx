import { useState } from "react";

export default function BookFinder() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaries, setSummaries] = useState({});

  const toggleSummary = async (book) => {
    const existing = summaries[book.key];
    if (existing?.status === "loading") return;

    if (existing && existing.status !== "error") {
      setSummaries((current) => ({
        ...current,
        [book.key]: { ...existing, expanded: !existing.expanded },
      }));
      return;
    }

    setSummaries((current) => ({
      ...current,
      [book.key]: { status: "loading", expanded: true },
    }));

    try {
      const response = await fetch(`https://openlibrary.org${book.key}.json`);
      if (!response.ok) {
        throw new Error(`Book description failed with status ${response.status}`);
      }

      const data = await response.json();
      const description =
        typeof data.description === "string"
          ? data.description
          : data.description?.value;
      const firstSentence = Array.isArray(book.first_sentence)
        ? book.first_sentence[0]
        : book.first_sentence;
      const text = description || firstSentence;
      const shortText =
        text && text.length > 320 ? `${text.slice(0, 317).trimEnd()}...` : text;

      setSummaries((current) => ({
        ...current,
        [book.key]: {
          status: shortText ? "ready" : "unavailable",
          text: shortText || "A description is not available for this book.",
          expanded: true,
        },
      }));
    } catch (err) {
      console.error("Failed to load book description:", err);
      setSummaries((current) => ({
        ...current,
        [book.key]: {
          status: "error",
          text: "Could not load the description. Please try again.",
          expanded: true,
        },
      }));
    }
  };

  // Fetch books from Open Library API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error(`Book search failed with status ${response.status}`);
      }
      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs.slice(0, 12));
        setSummaries({});
      } else {
        setBooks([]);
        setSummaries({});
        setError("No books found for your search.");
      }
    } catch (err) {
      console.error("Failed to search for books:", err);
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} dir="ltr">
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>📚 Book Finder</h1>
          <p style={styles.subtitle}>
            Search for books and explore their details and descriptions
          </p>
        </header>

        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            placeholder="Search by book title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
            aria-label="Book title"
          />
          <button type="submit" style={styles.button}>
            Search
          </button>
        </form>

        {loading && <p style={styles.loading}>Searching for books...</p>}
        {error && (
          <p style={styles.error} role="alert">
            {error}
          </p>
        )}

        <div style={styles.grid}>
          {books.map((book) => (
            <article key={book.key} style={styles.card}>
              {book.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                  alt={book.title}
                  style={styles.cover}
                />
              ) : (
                <div style={styles.noCover}>No cover available</div>
              )}
              <h3 style={styles.bookTitle}>{book.title}</h3>
              <p style={styles.author}>
                <strong>Author:</strong>{" "}
                {book.author_name
                  ? book.author_name.slice(0, 2).join(", ")
                  : "Unknown"}
              </p>
              <dl style={styles.specifications}>
                {[
                  ["First published", book.first_publish_year],
                  ["Pages (approx.)", book.number_of_pages_median],
                  ["Editions", book.edition_count],
                  ["Publisher", book.publisher?.[0]],
                  ["Language", book.language?.slice(0, 3).join(", ")],
                  ["ISBN", book.isbn?.slice(0, 2).join(", ")],
                  ["Subjects", book.subject?.slice(0, 3).join(", ")],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} style={styles.specification}>
                      <dt style={styles.specificationLabel}>{label}</dt>
                      <dd style={styles.specificationValue}>{value}</dd>
                    </div>
                  ))}
              </dl>
              {book.key && (
                <section style={styles.summarySection}>
                  <button
                    type="button"
                    onClick={() => toggleSummary(book)}
                    disabled={summaries[book.key]?.status === "loading"}
                    aria-expanded={Boolean(summaries[book.key]?.expanded)}
                    style={styles.summaryButton}
                  >
                    {summaries[book.key]?.status === "loading"
                      ? "Loading description..."
                      : summaries[book.key]?.status === "error"
                        ? "Try again"
                        : summaries[book.key]?.expanded
                          ? "Hide description"
                          : "Show short description"}
                  </button>
                  {summaries[book.key]?.expanded && (
                    <p
                      style={
                        summaries[book.key].status === "error"
                          ? styles.summaryError
                          : styles.summaryText
                      }
                      role={
                        summaries[book.key].status === "error"
                          ? "alert"
                          : undefined
                      }
                    >
                      {summaries[book.key].text}
                    </p>
                  )}
                </section>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// Modern Inline Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "40px 20px",
  },
  wrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: "35px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#38bdf8",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1rem",
  },
  form: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  input: {
    width: "100%",
    maxWidth: "450px",
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    color: "#38bdf8",
    fontSize: "1.2rem",
  },
  error: {
    textAlign: "center",
    color: "#f87171",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "24px",
    alignItems: "stretch",
  },
  card: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cover: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  noCover: {
    width: "100%",
    height: "240px",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    marginBottom: "12px",
    textAlign: "center",
    padding: "12px",
    boxSizing: "border-box",
  },
  bookTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: "8px",
    lineHeight: "1.3",
  },
  author: {
    fontSize: "0.875rem",
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  specifications: {
    margin: "8px 0 16px",
  },
  specification: {
    display: "grid",
    gridTemplateColumns: "minmax(90px, 0.8fr) minmax(0, 1.2fr)",
    gap: "8px",
    padding: "7px 0",
    borderBottom: "1px solid #334155",
  },
  specificationLabel: {
    color: "#94a3b8",
    fontSize: "0.75rem",
  },
  specificationValue: {
    color: "#e2e8f0",
    fontSize: "0.75rem",
    margin: 0,
    overflowWrap: "anywhere",
  },
  summarySection: {
    marginBottom: "16px",
  },
  summaryButton: {
    backgroundColor: "transparent",
    color: "#7dd3fc",
    fontSize: "0.85rem",
    padding: "8px 0",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  summaryText: {
    color: "#cbd5e1",
    fontSize: "0.85rem",
    lineHeight: 1.5,
    margin: "4px 0 0",
  },
  summaryError: {
    color: "#f87171",
    fontSize: "0.85rem",
    lineHeight: 1.5,
    margin: "4px 0 0",
  },
};

import { useMemo, useState } from "react";
import BookPicker from "./BookPicker";

export default function TopBar({ term, onTermChange, books, selectedBookIds, onSelectedBookIdsChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedCount = selectedBookIds.length;
  const totalCount = books.length;


  return (
    <header className="topbar">
      <div className="termBox">
        <span className="icon">⌕</span>
        <input
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
          placeholder="Term (e.g. market)"
          className="termInput"
        />
      </div>

      <div className="topbarRight">
        <div className="compareBlock">
          <div className="compareLabel">Compare</div>
          <button className="bookButton" onClick={() => setPickerOpen((v) => !v)} aria-haspopup="dialog">
            Books: {selectedCount} / {totalCount} <span className="caret">▾</span>
          </button>

          {pickerOpen && (
            <BookPicker
              books={books}
              selectedBookIds={selectedBookIds}
              onSelectedBookIdsChange={onSelectedBookIdsChange}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <button className="iconButton" title="Settings" aria-label="Settings">
          ⚙︎
        </button>
      </div>
    </header>
  );
}
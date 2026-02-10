export default function BookPicker({ books, selectedBookIds, onSelectedBookIdsChange, onClose }) {
  const toggle = (id) => {
    if (selectedBookIds.includes(id)) onSelectedBookIdsChange(selectedBookIds.filter((x) => x !== id));
    else onSelectedBookIdsChange([...selectedBookIds, id]);
  };

  return (
    <div className="popover" role="dialog">
      <div className="popoverHeader">
        <div>
          <div className="popoverTitle">Select books to compare</div>
        </div>
        <button className="iconButton" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="bookList">
        {books.map((b) => (
          <label key={b.id} className="bookRow">
            <input type="checkbox" checked={selectedBookIds.includes(b.id)} onChange={() => toggle(b.id)} />
            <span className="bookId">{b.label}</span>
          </label>
        ))}
      </div>

      <div className="popoverFooter">
        <button className="secondary" onClick={() => onSelectedBookIdsChange(books.map((b) => b.id))}>
          Select all
        </button>
        <button className="secondary" onClick={() => onSelectedBookIdsChange([])}>
          Clear
        </button>
      </div>
    </div>
  );
}

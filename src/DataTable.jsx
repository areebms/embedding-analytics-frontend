const seriesIds = ['3300', '33310', '30107'];

export function DataTable({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Term</th>
          {seriesIds.map((id) => (
            <th key={id}>{id}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.term}>
            <td>{i}</td>
            <td><a href={`http://localhost:5173/?term=${row.term}`}>{row.term}</a></td>
            {seriesIds.map((id) => (
              <td key={id}>{Number(row[id]?.similarity).toFixed(3)} {Number(100 * row[id]?.stability).toFixed(1)}% (n={Number(row[id]?.count)})</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

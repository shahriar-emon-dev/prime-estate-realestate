/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  actions?: {
    label: string;
    onClick: (row: any) => void;
    color?: string;
  }[];
}

export default function Table({ columns, data, actions }: TableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={`${index}-${col.key}`} className="px-6 py-4 text-sm text-gray-700">
                    {row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => action.onClick(row)}
                          className={`px-3 py-1 rounded text-white text-xs sm:text-sm whitespace-nowrap transition-colors ${
                            action.color === 'danger'
                              ? 'bg-red-600 hover:bg-red-700'
                              : action.color === 'warning'
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : action.color === 'success'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
}

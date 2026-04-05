import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';

const PostTable = ({ data, onEdit }) => {
    const columns = useMemo(
        () => [
            {
                header: 'Schedule',
                accessorKey: 'date',
                cell: info => (
                    <div className="text-sm">
                        <p className="font-bold text-slate-900">{info.getValue()}</p>
                        <p className="text-slate-500">{info.row.original.time}</p>
                    </div>
                )
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: info => {
                    const status = info.getValue()?.toLowerCase();
                    const colors = {
                        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                        posted: 'bg-green-100 text-green-700 border-green-200',
                        failed: 'bg-red-100 text-red-700 border-red-200',
                    };
                    return (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || 'bg-slate-100'}`}>
                            {info.getValue()}
                        </span>
                    );
                }
            },
            {
                header: 'Content Preview',
                accessorKey: 'title',
                cell: info => (
                    <div className="max-w-md truncate">
                        <p className="font-semibold text-slate-900">{info.getValue()}</p>
                        <p className="text-xs text-slate-500 truncate">{info.row.original.caption}</p>
                    </div>
                )
            },
            {
                header: 'Actions',
                cell: info => (
                    <button
                        onClick={() => onEdit(info.row.original)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl transition-all active:scale-95"
                    >
                        Edit
                    </button>
                )
            }
        ],
        [onEdit]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                        {table.getRowModel().rows.map(row => (
                            <motion.tr
                                key={row.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-slate-50/50 transition-all group"
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-6">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

export default PostTable;

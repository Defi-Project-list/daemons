import React, { useEffect, useState } from "react";
import "./styles.css";

export interface PaginationFooterProps {
    page: number;
    totalCount: number;
    itemsPerPage: number;
    setPage: (value: number) => any;
}

function PaginationFooter({
    page,
    totalCount,
    itemsPerPage,
    setPage
}: PaginationFooterProps): JSX.Element {
    const [paginationRange, setPaginationRange] = useState<number[]>([]);
    const lastPage = Math.ceil(totalCount / itemsPerPage);

    useEffect(() => {
        const newRange: number[] = [];
        if (page > 2) newRange.push(page - 2);
        else newRange.push(-1);

        if (page > 1) newRange.push(page - 1);
        else newRange.push(-1);

        newRange.push(page);

        if (page < lastPage) newRange.push(page + 1);
        else newRange.push(-1);

        if (page < lastPage - 1) newRange.push(page + 2);
        else newRange.push(-1);

        setPaginationRange(newRange);
    }, [page, totalCount]);

    if (totalCount < itemsPerPage) return <></>;

    return (
        <div className="pagination">
            {/* Previous page arrow */}
            {page > 1 ? (
                <div
                    className="pagination__item pagination__arrow pagination__arrow--reversed"
                    onClick={() => setPage(page - 1)}
                />
            ) : (
                <div className="pagination__item pagination__arrow pagination__item--disabled pagination__arrow--reversed" />
            )}

            {/* Clickable pages */}
            {paginationRange.map((pageNumber: number, i: number) =>
                pageNumber === -1 ? (
                    <div key={i + 100} className="pagination__placeholder" />
                ) : (
                    <div
                        className={`pagination__item ${
                            pageNumber === page ? "pagination__item--active" : ""
                        }`}
                        key={pageNumber}
                        onClick={() => {
                            setPage(pageNumber);
                        }}
                    >
                        {pageNumber}
                    </div>
                )
            )}

            {/* Next page arrow */}
            {page !== lastPage ? (
                <div
                    className="pagination__item pagination__arrow"
                    onClick={() => setPage(page + 1)}
                />
            ) : (
                <div className="pagination__item pagination__arrow pagination__item--disabled" />
            )}
        </div>
    );
}

export default PaginationFooter;

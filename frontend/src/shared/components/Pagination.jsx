import ReactPaginate from "react-paginate";

export default function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center">
      <ReactPaginate
        forcePage={page - 1}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={({ selected }) => setPage(selected + 1)}
        previousLabel="<"
        nextLabel=">"
        containerClassName="flex space-x-2"
        pageLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 
                           hover:bg-blue-500 hover:text-white cursor-pointer transition"
        previousLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 
                               hover:bg-blue-500 hover:text-white cursor-pointer transition"
        nextLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 
                           hover:bg-blue-500 hover:text-white cursor-pointer transition"
        activeLinkClassName="bg-blue-500 text-white border-blue-500"
        disabledLinkClassName="opacity-50 cursor-not-allowed"
      />
    </div>
  );
}

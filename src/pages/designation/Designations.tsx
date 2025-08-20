import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import React from "react";
import { Header } from "../workspace/PMView";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteDesignation, GetDesignationByPage } from "@/utils/Designation";
import { DesignationModal } from "./DesignationModal";

export const Designations: React.FC = () => {
  const [designations, setDesignations] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editDesignation, setEditDesignation] = React.useState(null);

  const [headers, setHeaders] = React.useState<Header[]>([
    {
      label: "S.no",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "100px",
      url: "Designations",
      order_no: 1,
    },
    {
      label: "Designation",
      key: "designation_name",
      visible: true,
      type: "string",
      column_width: "200px",
      url: "Designations",
      order_no: 2,
    },
    {
      key: "is_active",
      label: "Status",
      visible: true,
      type: "status",
      column_width: "200px",
      url: "Designations",
      order_no: 3,
    },
    {
      key: "created_at",
      label: "Created At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Designations",
      order_no: 4,
    },
    {
      key: "updated_at",
      label: "Updated At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Designations",
      order_no: 4,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "Designations",
      order_no: 5,
    },
  ]);

  const fetchDesignations = async (query: any) => {
    try {
      const response = await GetDesignationByPage(query);
      const parsedRes = JSON.parse(response);
      setDesignations(parsedRes.data.designations);
      setTotalPages(Math.ceil(parsedRes.pagination.totalRecords / rowsPerPage));
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  /* pagination */
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDesignations({
      pageNo: page,
      pageSize: rowsPerPage,
    });
  };
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    fetchDesignations({
      pageNo: currentPage,
      pageSize: rows,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDesignation(id);
    } catch (error) {
      console.error("Error deleting designation:", error);
    } finally {
      fetchDesignations({
        pageNo: currentPage,
        pageSize: rowsPerPage,
      });
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      fetchDesignations({
        pageNo: currentPage,
        pageSize: rowsPerPage,
      });
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex">
        <div className="flex-1 overflow-auto">
          <AdvancedDataTable
            data={designations}
            data_type={"designation"}
            columns={headers}
            actions={(item) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditDesignation(item);
                    setModalVisible(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete this classification?"
                      )
                    )
                      handleDelete(item.classification_id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
            isCreate={true}
            onCreate={() => setModalVisible(true)}
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
          />
        </div>
      </div>

      {/* add/edit modal */}
      <DesignationModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditDesignation(null);
        }}
        onCreate={() => {
          fetchDesignations({
            PageNo: currentPage,
            PageSize: rowsPerPage,
          });
          setModalVisible(false);
        }}
        editDesignation={editDesignation}
      />
    </>
  );
};

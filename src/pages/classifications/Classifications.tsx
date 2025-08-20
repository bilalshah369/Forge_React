import React from "react";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { deleteClassification, GetClasssifcationByPage } from "@/utils/Masters";
import { Header } from "../workspace/PMView";
import { ClassificationModal } from "./AddClassificationModal";
import { Edit, Trash2 } from "lucide-react";
import AlertBox from "@/components/ui/AlertBox";

export const Classifications: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [classification, setClassification] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editClassification, setEditClassification] = React.useState(null);

  /* Alert states */
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const [headers, setHeaders] = React.useState<Header[]>([
    {
      label: "S.no",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "100px",
      url: "Classifications",
      order_no: 1,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "string",
      column_width: "200px",
      url: "Classifications",
      order_no: 1,
    },
    {
      key: "is_active",
      label: "Status",
      visible: true,
      type: "status",
      column_width: "200px",
      url: "Classifications",
      order_no: 2,
    },
    {
      key: "created_at",
      label: "Created At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Classifications",
      order_no: 3,
    },
    {
      key: "updated_at",
      label: "Updated At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Classifications",
      order_no: 4,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "Classifications",
      order_no: 19,
    },
  ]);
  const fetchClassifications = async (query: {
    PageNo: number;
    PageSize: number;
  }) => {
    setLoading(true);
    try {
      const response = await GetClasssifcationByPage(query);
      const parsedRes = JSON.parse(response);
      setClassification(parsedRes.data.classifications);
      setTotalPages(Math.ceil(parsedRes.pagination.totalRecords / rowsPerPage));
    } catch (error) {
      console.error("Error fetching classifications:", error);
    } finally {
    }
  };

  /* pagination */
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClassifications({
      PageNo: page,
      PageSize: rowsPerPage,
    });
  };
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    fetchClassifications({
      PageNo: currentPage,
      PageSize: rows,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteClassification(id);
      showAlert("Classification deleted successfully");
    } catch (error) {
      console.error("Error deleting classification:", error);
      showAlert("Error deleting classification");
    } finally {
      fetchClassifications({
        PageNo: currentPage,
        PageSize: rowsPerPage,
      });
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      fetchClassifications({
        PageNo: currentPage,
        PageSize: rowsPerPage,
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex">
        <div className="flex-1 overflow-auto">
          <AdvancedDataTable
            data={classification}
            data_type={"classification"}
            columns={headers}
            actions={(item) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditClassification(item);
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
      <ClassificationModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditClassification(null);
        }}
        onCreate={() =>
          fetchClassifications({
            PageNo: currentPage,
            PageSize: rowsPerPage,
          })
        }
        editClassification={editClassification}
      />

      {/* alert box */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </>
  );
};

import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import React from "react";
import { Header } from "../workspace/PMView";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DeleteRole, GetRolesByPage } from "@/utils/RoleMaster";
import { RoleModal } from "./RolesModal";
import AlertBox from "@/components/ui/AlertBox";
import { useLabels } from "../edit-field-labels/LabelContext";

const Roles: React.FC = () => {
  const [roles, setRoles] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editRole, setEditRole] = React.useState(null);
  const { labels } = useLabels();
  const labelRoles = labels["role"] || {
    display: "Role",
  };
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
      url: "Roles",
      order_no: 1,
    },
    {
      label: labelRoles.display,
      key: "role_name",
      visible: true,
      type: "string",
      column_width: "200px",
      url: "Roles",
      order_no: 2,
    },
    {
      key: "is_active",
      label: "Status",
      visible: true,
      type: "status",
      column_width: "200px",
      url: "Roles",
      order_no: 3,
    },
    {
      key: "created_at",
      label: "Created At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Roles",
      order_no: 4,
    },
    {
      key: "updated_at",
      label: "Updated At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Roles",
      order_no: 4,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "Roles",
      order_no: 5,
    },
  ]);

  const fetchRoles = async (query: any) => {
    try {
      const response = await GetRolesByPage(query);
      const parsedRes = JSON.parse(response);
      setRoles(parsedRes.data.roles);
      setTotalPages(Math.ceil(parsedRes.pagination.totalRecords / rowsPerPage));
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  /* pagination */
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRoles({
      PageNo: page,
      PageSize: rowsPerPage,
    });
  };
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    fetchRoles({
      PageNo: currentPage,
      PageSize: rowsPerPage,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await DeleteRole(id);
      showAlert("Role deleted successfully");
    } catch (error) {
      console.error("Error deleting role:", error);
      showAlert("Error deleting role");
    } finally {
      fetchRoles({
        PageNo: currentPage,
        PageSize: rowsPerPage,
      });
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      fetchRoles({
        PageNo: currentPage,
        PageSize: rowsPerPage,
      });
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex">
        <div className="flex-1 overflow-auto">
          <AdvancedDataTable
            data={roles}
            data_type={"role"}
            columns={headers}
            actions={(item) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditRole(item);
                    setModalVisible(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete this classification?"
                      )
                    )
                      handleDelete(item.role_id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-white" />
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
      <RoleModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditRole(null);
        }}
        onCreate={() => {
          fetchRoles({
            PageNo: currentPage,
            PageSize: rowsPerPage,
          });
          setModalVisible(false);
        }}
        editRole={editRole}
      />

      {/* alertbox */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </>
  );
};
export default Roles;

import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import React from "react";
import { Header } from "../workspace/PMView";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  DeleteApplications,
  GetApplicationsByPage,
} from "@/utils/ImpactedApps";
import { ApplicationModal } from "./ImpactedAppsModal";

export const ImpactedApps: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [applications, setApplications] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editApplication, setEditApplication] = React.useState(null);

  const [headers, setHeaders] = React.useState<Header[]>([
    {
      label: "S.no",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "100px",
      url: "Applications",
      order_no: 1,
    },
    {
      label: "Application",
      key: "application_name",
      visible: true,
      type: "string",
      column_width: "200px",
      url: "Applications",
      order_no: 2,
    },
    {
      key: "is_active",
      label: "Status",
      visible: true,
      type: "status",
      column_width: "200px",
      url: "Applications",
      order_no: 3,
    },
    {
      key: "created_at",
      label: "Created At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Applications",
      order_no: 4,
    },
    {
      key: "updated_at",
      label: "Updated At",
      visible: true,
      type: "date",
      column_width: "200px",
      url: "Applications",
      order_no: 4,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "Applications",
      order_no: 5,
    },
  ]);

  const fetchApplications = async (query: any) => {
    setLoading(true);
    try {
      const response = await GetApplicationsByPage(query);
      const parsedRes = JSON.parse(response);
      setApplications(parsedRes.data.impacted_applications);
      setTotalPages(Math.ceil(parsedRes.pagination.totalRecords / rowsPerPage));
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  /* pagination */
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplications({
      PageNo: page,
      PageSize: rowsPerPage,
    });
  };
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    fetchApplications({
      PageNo: currentPage,
      PageSize: rows,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await DeleteApplications(id);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        toast({
          title: "Success",
          description: "Application deleted successfully",
          variant: "default",
        });
      } else {
        console.error("Error deleting application:", parsedRes);
        toast({
          title: "Error",
          description: "Failed to delete application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      fetchApplications({
        PageNo: currentPage,
        PageSize: rowsPerPage,
      });
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      fetchApplications({
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
            data={applications}
            data_type={"application"}
            columns={headers}
            actions={(item) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditApplication(item);
                    setModalVisible(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-black" />
                </button>
                <button onClick={() => handleDelete(item.application_id)}>
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
      <ApplicationModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditApplication(null);
        }}
        onCreate={() => {
          fetchApplications({
            PageNo: currentPage,
            PageSize: rowsPerPage,
          });
          setModalVisible(false);
        }}
        editApplication={editApplication}
      />
    </>
  );
};

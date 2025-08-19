import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { deleteClassification, GetClasssifcation } from "@/utils/Masters";
import React from "react";
import { Header } from "../workspace/PMView";
import { ClassificationModal } from "./AddClassificationModal";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Classifications: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [classification, setClassification] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editClassification, setEditClassification] = React.useState(null);

  const [headers, setHeaders] = React.useState<Header[]>([
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
  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const response = await GetClasssifcation("");
      const parsedRes = JSON.parse(response);
      setClassification(parsedRes.data.classifications);
    } catch (error) {
      console.error("Error fetching classifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteClassification(id);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        toast({
          title: "Success",
          description: "Classification deleted successfully",
          variant: "default",
        });
      } else {
        console.error("Error deleting classification:", parsedRes);
        toast({
          title: "Error",
          description: "Failed to delete classification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting classification:", error);
    } finally {
      fetchClassifications();
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      fetchClassifications();
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
                    console.log("Edit classification:", item);
                    setEditClassification(item);
                    setModalVisible(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-black" />
                </button>
                <button onClick={() => handleDelete(item.classification_id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
            isCreate={true}
            onCreate={() => setModalVisible(true)}
          />
        </div>
      </div>

      <ClassificationModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditClassification(null);
        }}
        onCreate={fetchClassifications}
        editClassification={editClassification}
      />
    </>
  );
};

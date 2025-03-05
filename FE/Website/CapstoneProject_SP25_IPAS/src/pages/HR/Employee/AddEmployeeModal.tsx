import { AutoComplete, Avatar, Input, Spin, Empty } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { ModalForm } from "@/components";
import { employeeService } from "@/services";
import style from "./EmployeeList.module.scss";

type UserOption = {
  userId: number;
  email: string;
  label: JSX.Element;
};

type AddEmployeeModelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number) => void;
  isLoadingAction?: boolean;
};

const AddEmployeeModel = ({ isOpen, onClose, onSave, isLoadingAction }: AddEmployeeModelProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setOptions([]);
    setSelectedUser(null);
    setSearch("");
  }, [isOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await employeeService.getUserByEmail(debouncedSearch);
        if (res.statusCode === 200 && res.data) {
          const user = res.data;
          setOptions([
            {
              userId: user.userId,
              email: user.email,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar src={user.avatarURL} />
                  <span>
                    {user.fullName} ({user.email})
                  </span>
                </div>
              ),
            },
          ]);
        } else {
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [debouncedSearch]);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => selectedUser && onSave(selectedUser.userId)}
      isLoading={isLoadingAction}
      title="Add New Employee"
      noDivider={true}
    >
      <AutoComplete
        className={style.addEmployeeModal}
        options={options.map(({ userId, label }) => ({ value: userId.toString(), label }))}
        value={selectedUser ? selectedUser.email : search} // Hiển thị email nếu đã chọn
        onSearch={(value) => {
          setSearch(value);
          setSelectedUser(null); // Reset khi nhập mới
        }}
        onSelect={(value) => {
          const user = options.find((opt) => opt.userId.toString() === value);
          if (user) {
            setSelectedUser(user);
            setSearch(user.email); // Gán email vào input
          }
        }}
        placeholder="Enter employee email"
        notFoundContent={loading ? <Spin size="small" /> : <Empty description="No data found" />}
      >
        <Input.Search loading={loading} />
      </AutoComplete>
    </ModalForm>
  );
};

export default AddEmployeeModel;

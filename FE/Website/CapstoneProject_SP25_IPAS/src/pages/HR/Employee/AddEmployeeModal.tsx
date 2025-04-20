import { AutoComplete, Avatar, Input, Spin, Empty, Flex } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { ModalForm, UserAvatar } from "@/components";
import { employeeService } from "@/services";
import style from "./EmployeeList.module.scss";
import { GetUserRoleEmployee } from "@/payloads";

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
  const [options, setOptions] = useState<GetUserRoleEmployee[]>([]);
  const [selectedUser, setSelectedUser] = useState<GetUserRoleEmployee | null>(null);

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
        if (res.statusCode === 200) {
          if (res.data) {
            setOptions(res.data);
          } else {
            setOptions([]);
          }
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
        options={options.map((user) => ({
          value: user.userId.toString(),
          label: (
            <Flex align="center" gap={8}>
              <UserAvatar avatarURL={user?.avatarURL} />
              <span>
                {user.fullName} ({user.email})
              </span>
            </Flex>
          ),
        }))}
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
        <Input.Search loading={loading} allowClear />
      </AutoComplete>
    </ModalForm>
  );
};

export default AddEmployeeModel;

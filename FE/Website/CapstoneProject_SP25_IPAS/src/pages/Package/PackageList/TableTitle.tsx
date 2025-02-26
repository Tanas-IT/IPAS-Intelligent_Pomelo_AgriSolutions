import { Flex, Popover } from "antd";
import { Searchbar, CustomButton, ModalForm } from "@/components";
import { Icons } from "@/assets";
import style from "./PackageList.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPackageModal from "./AddPackageModal";
import { useModal } from "@/hooks";
import { PackageRequest } from "@/payloads/package/requests/PackageRequest";

type TableTitleProps = {
    onSearch: (value: string) => void;
    filterContent: JSX.Element;
};

export const TableTitle = ({ onSearch, filterContent }: TableTitleProps) => {
    const navigate = useNavigate();
    const addModal = useModal<PackageRequest>();

    const handleClickAdd = () => {
        addModal.showModal();
    }

    const handleAdd = () => {

    }


    return (
        <Flex className={style.headerWrapper}>
            <Flex className={style.sectionLeft}>
                <Searchbar onSearch={onSearch} />
                <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
                    <>
                        <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => { }} />
                    </>
                </Popover>
            </Flex>
            <Flex className={style.sectionRight}>
                <CustomButton label="Add New Package" icon={<Icons.plus />} handleOnClick={handleClickAdd} />
            </Flex>
            <AddPackageModal
                isOpen={addModal.modalState.visible}
                onClose={addModal.hideModal}
                onSave={handleAdd}
            />
        </Flex>
    );
};

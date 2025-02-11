import { Input } from "antd";
import { FC, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import style from "./SearchHeader.module.scss";
import { Icons } from "@/assets";

interface SearchHeaderProps {
  onSearch: (value: string) => void;
}

const SearchHeader: FC<SearchHeaderProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue] = useDebounce(inputValue, 300);

  useEffect(() => {
    onSearch(debouncedInputValue);
  }, [debouncedInputValue]);

  const handleFocus = () => {
    // Handle focus event
  };

  const handleBlur = () => {
    // Handle blur event
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDeleteTextSearch = () => {
    setInputValue("");
  };

  return (
    <div className={style.searchbar}>
      <Input
        className={style.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        value={inputValue}
        placeholder="Search here"
        spellCheck={false}
        suffix={<Icons.search />}
      />
    </div>
  );
};

export default SearchHeader;

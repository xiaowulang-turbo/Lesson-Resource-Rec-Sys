import { useSearchParams } from "react-router-dom";
import Select from "./Select";
import PropTypes from "prop-types";

SortBy.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  type: PropTypes.string,
};

export default function SortBy({ options, type }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "asc";

  const handleChange = (e) => {
    searchParams.set("sortBy", e.target.value);
    setSearchParams(searchParams);
  };

  return (
    <Select
      options={options}
      value={sortBy}
      type={type}
      onChange={handleChange}
    />
  );
}

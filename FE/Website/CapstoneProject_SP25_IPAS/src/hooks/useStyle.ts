import { createStyles } from "antd-style";

const useStyle = createStyles(({ css }) => {
  const primaryColor = "#326E2F";
  const hoverBackground = "#f0fff0";

  return {
    customTable: css`
      .ant-table {
        .ant-table-container {
          .ant-table-body,
          .ant-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }

        .ant-table-row {
          transition: background-color 0.3s ease;

          &:hover {
            background-color: ${hoverBackground} !important;
          }
        }

        .ant-table-cell-row-hover {
          background-color: ${hoverBackground} !important;
        }

        .ant-table-footer {
          text-align: center;
          padding: 10px 16px;
          background-color: transparent;
        }
      }
    `,

    customCheckbox: css`
      .ant-checkbox-inner {
        border: 2px solid #3333 !important;
      }

      .ant-checkbox-checked .ant-checkbox-inner {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
      }

      .ant-checkbox-checked:hover {
        opacity: 0.8;
      }

      .ant-checkbox:hover .ant-checkbox-inner {
        border-color: ${primaryColor} !important;
      }

      .ant-checkbox-inner:after {
        background-color: ${primaryColor};
        border-color: white;
      }
    `,

    customSelect: css`
      .ant-pagination-item-link-icon {
        color: ${primaryColor} !important;
      }

      .ant-select-selector:hover {
        border-color: ${primaryColor} !important;
      }

      .ant-segmented-item-label {
        color: ${primaryColor} !important;
      }
    `,
    customTab: css`
      .ant-tabs-tab:hover,
      .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: ${primaryColor};
        outline: none;
      }
      .ant-tabs-ink-bar {
        background-color: ${primaryColor};
      }
    `,
    customSegment: css`
      .ant-segmented-item {
        color: ${primaryColor};
        background-color: transparent;
        display: flex;
        justify-content: center;
        text-align: center;
        border-radius: 12px;
      }

      .ant-segmented-item-selected {
        background-color: ${primaryColor} !important;
        color: white !important;
        display: flex;
        justify-content: center;
        text-align: center;
      }

      .ant-segmented-item-label {
        font-size: 14px;
        justify-content: center;
        text-align: center;
      }

      .ant-segmented-item-icon {
        display: flex;
        align-items: center;
        text-align: center;
        margin-top: 7px;
      }

    `,
    customInput: css`
      .ant-picker-input > input,
      .ant-input .ant-input-outlined,
      input {
        font-size: 16px !important;
  }
    `,
    customPlaceholder: css`
      .ant-select-selection-placeholder {
        font-size: 16px;
      }
    `,
    customSlick: css`
      .slick-next, .slick-prev {
        z-index: 2;
  }

      .slick-next:before, .slick-prev:before {
        font-size: 20px;
        line-height: 1;
        opacity: 0.75;
        color: #20461e;
  }
`

  };
});

export default useStyle;

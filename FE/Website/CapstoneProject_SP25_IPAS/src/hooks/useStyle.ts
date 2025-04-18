import { createStyles } from "antd-style";

const useStyle = createStyles(({ css }) => {
  const primaryColor = "#326E2F";
  const secondColor = "#bcd379";
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

        .ant-table-row-expand-icon:hover,
        .ant-table-row-expand-icon:focus {
          color: ${primaryColor} !important;
        }

        .ant-table-expanded-row ant-table-expanded-row-level-1 {
          background-color: ${secondColor} !important;
        }

        .ant-table-footer {
          text-align: center;
          padding: 10px 16px;
          background-color: transparent;
        }
      }
    `,

    customExpandTable: css`
      .ant-table th {
        background-color: #e8f5e9 !important;
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
      ant-select-item ant-select-item-option ant-select-item-option-selected {
        background-color: ${primaryColor} !important;
      }
      .ant-pagination-item-link-icon {
        color: ${primaryColor} !important;
      }

      &.ant-select-focused .ant-select-selector,
      .ant-select-selector:hover {
        border-color: ${primaryColor} !important;
        outline: none;
        box-shadow: none !important;
      }

      .ant-segmented-item-label {
        color: ${primaryColor} !important;
      }

      .ant-form-item-label > label,
      .ant-form-item-required {
        font-size: 16px;
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
    customInput2: css`
      .ant-input-outlined:hover,
      .ant-input-outlined:focus-within {
        border-color: ${primaryColor} !important;
        outline: none;
        box-shadow: none !important;
      }
    `,
    customPlaceholder: css`
      .ant-select-selection-placeholder {
        font-size: 16px;
      }
    `,
    customSlick: css`
      .slick-next,
      .slick-prev {
        z-index: 2;
      }

      .slick-next:before,
      .slick-prev:before {
        font-size: 20px;
        line-height: 1;
        opacity: 0.75;
        color: #20461e;
      }
    `,
    customSwitch: css`
      .ant-switch-handle:before,
      .ant-switch.ant-switch-checked {
        background-color: ${primaryColor} !important;
      }

      .ant-switch.ant-switch-checked,
      .ant-switch-checked {
        background: ${primaryColor} !important;
      }
    `,
    customButton: css`
      .ant-modal-footer > .ant-btn + .ant-btn {
        background-color: ${primaryColor};
      }
    `,
    customUpload: css`
      .ant-upload.ant-upload-select,
      .ant-upload.ant-upload-drag {
        &:hover {
          border-color: ${primaryColor} !important;
        }
      }
    `,

    customTimeline: css`
      .ant-timeline-item-tail {
        background-color: ${secondColor} !important;
      }
    `,
    customFormItemInput: css`
      .ant-form-item-label > label {
        font-size: 16px;
      }
    `,
    customDateRange: css`
      .ant-picker-active-bar {
        background-color: ${secondColor} !important;
      }
    `,
    customSteps: css`
      .ant-steps-item-finish .ant-steps-item-icon {
        background-color: #d9e6b4 !important;
        border-color: #d9e6b4 !important;
        .ant-steps-icon {
          color: ${primaryColor} !important;
        }
      }
      .ant-steps-item-finish .ant-steps-item-title::after {
        background-color: ${secondColor} !important;
      }
      .ant-steps-item-active .ant-steps-item-title,
      .ant-steps-item-finish .ant-steps-item-title {
        color: ${primaryColor} !important;
      }
      .ant-steps-item-active .ant-steps-item-icon {
        background-color: ${secondColor} !important;
        border-color: ${secondColor} !important;
        .ant-steps-icon {
          color: ${primaryColor} !important;
        }
      }
    `,
    customeTable: css`
      .ant-table-cell {
        background-color: #326e2f !important;
        color: white !important;
      }
      ,
      .ant-table-tbody > tr:hover {
        background-color: rgb(153, 25, 25) !important;
      }
    `,
    customDrawer: css`
      .ant-drawer-body {
        overflow: hidden;
      }
    `,
    customeTable2: css`
      .ant-table-thead > tr > th {
        background-color: #bcd379 !important;
        color: #20461e !important;
      }
      ,
      .ant-table-tbody > tr:hover {
        background-color: rgb(214, 220, 196) !important;
      }
    `,
    customCollapse: css`
      .ant-collapse-header {
        display: flex !important;
        align-items: center !important;
        width: 30rem;
      }
      .ant-collapse-extra {
        display: flex !important;
      }
    `,
  };
});

export default useStyle;

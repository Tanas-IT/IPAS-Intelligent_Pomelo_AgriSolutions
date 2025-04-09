import { ColumnType } from 'antd/es/table';
import { Tag, Tooltip, Image } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GetReportResponse } from '@/payloads';
import style from '../ReportManagement/ReportManagement.module.scss';
import ReportActionMenu from './ReportActionMenu';

export const getReportColumns = (
  handleReply: (record: GetReportResponse) => void,
  handleViewDetails: (record: GetReportResponse) => void,
  handleAddToTraining: (record: GetReportResponse) => void
): ColumnType<GetReportResponse>[] => [
  {
    title: 'Report Code',
    dataIndex: 'reportCode',
    key: 'reportCode',
    width: 120,
    sorter: (a, b) => a.reportCode.localeCompare(b.reportCode),
    render: (text: string) => <span className={style.codeText}>{text}</span>,
  },
  {
    title: 'Image',
    dataIndex: 'imageURL',
    key: 'imageURL',
    width: 150,
    render: (text: string, record: GetReportResponse) => (
      <div className={style.userCell}>
        <Image
          src={record.imageURL}
          width={160}
          height={160}
          className={style.cardImage}
          crossOrigin="anonymous"
        />
      </div>
    ),
  },
  {
    title: 'Questioner',
    dataIndex: 'questionerName',
    key: 'questionerName',
    width: 150,
    render: (text: string, record: GetReportResponse) => (
      <div className={style.userCell}>
        <span className={style.userQuestion}>{record.questionOfUser}</span>
      </div>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    render: (text: string) => (
      <Tooltip title={text}>
        <span className={style.descriptionText}>{text || '-'}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Training Status',
    dataIndex: 'isTrainned',
    key: 'trainingStatus',
    width: 120,
    render: (isTrainned: boolean) => (
      <Tag color={isTrainned ? 'green' : 'orange'}>
        {isTrainned ? 'Trained' : 'Pending'}
      </Tag>
    ),
  },
  {
    title: 'Response Status',
    dataIndex: 'answerFromExpert',
    key: 'responseStatus',
    width: 120,
    render: (answer: string | null, record: GetReportResponse) => (
      <Tag
        icon={answer ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        color={answer ? 'success' : 'warning'}
      >
        {answer ? `Answered by ${record.answererName || 'expert'}` : 'Pending'}
      </Tag>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'createdDate',
    key: 'date',
    width: 150,
    sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    render: (date: string) => (
      <span className={style.dateText}>
        {new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 20,
    fixed: 'right',
    render: (_: unknown, record: GetReportResponse) => (
      <ReportActionMenu
        reportId={record.reportID}
        report={record}
        onReply={() => handleReply(record)}
        onViewDetails={() => handleViewDetails(record)}
        onAddToTraining={() => handleAddToTraining(record)}
      />
    ),
  },
];
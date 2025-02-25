import { useCallback, useEffect } from 'react';
import { useBlocker } from 'react-router';

import { useConfirm } from '../utils/confirm/confirm.hooks';
import { ConfirmOptions } from '../utils/confirm/confirm.types';

export const usePrompt = ({
  isDirty = false,
  title = 'You have unsaved changes!',
  subtitle = 'Are you sure you want to leave?',
  confirmText = 'Leave',
  cancelText = 'Stay',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmOptions & { isDirty?: boolean }) => {
  const blocker = useBlocker(isDirty);

  const { show } = useConfirm();

  const confirm = useCallback(() => {
    if (!isDirty) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
      show({
        title,
        subtitle,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          resolve(true);
          onConfirm?.();
        },
        onCancel: () => {
          resolve(false);
          onCancel?.();
        },
      });
    });
  }, [
    cancelText,
    confirmText,
    isDirty,
    onCancel,
    onConfirm,
    show,
    subtitle,
    title,
    type,
  ]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      confirm().then((result) => {
        if (result) blocker.proceed();
        else blocker.reset();
      });
    }
  }, [blocker, confirm]);

  useEffect(() => {
    if (isDirty) {
      window.onbeforeunload = () => subtitle;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [isDirty, subtitle]);

  return {
    confirm,
  };
};

// import { useConfirm } from '@/utils/confirm/confirm.hooks';
// import { useEffect } from 'react';

// export const usePrompt = ({ isDirty }: { isDirty: boolean }) => {
//   const confirm = useConfirm();

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (isDirty) {
//         e.preventDefault();
//         e.returnValue = ''; // Yêu cầu trình duyệt hiển thị thông báo
//       }
//     };

//     const handleRouteChange = () => {
//       if (isDirty) {
//         confirm.show({
//           title: 'Bạn có chắc chắn muốn rời khỏi trang?',
//           subtitle: 'Những thay đổi chưa được lưu sẽ bị mất.',
//           confirmText: 'Rời khỏi',
//           cancelText: 'Ở lại',
//           onConfirm: () => {
//             // Cho phép người dùng rời khỏi trang
//             window.removeEventListener('beforeunload', handleBeforeUnload);
//             window.location.href = '/'; // Điều hướng đến trang khác
//           },
//           onCancel: () => {
//             // Không làm gì cả, người dùng ở lại trang
//           },
//           type: 'warning',
//         });
//         return false; // Ngăn chặn điều hướng
//       }
//       return true; // Cho phép điều hướng
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handleRouteChange);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handleRouteChange);
//     };
//   }, [isDirty, confirm]);
// };
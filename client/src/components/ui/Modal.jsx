import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-[0.97]"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.97]"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg bg-surface-overlay border border-border-default p-6 text-left align-middle shadow-xl transition-all ${className}`}>
                <div className="flex items-center justify-between mb-4">
                  {title ? (
                    <Dialog.Title as="h3" className="text-lg font-semibold text-text-primary leading-tight">
                      {title}
                    </Dialog.Title>
                  ) : (
                    <div />
                  )}
                  <Button variant="ghost" onClick={onClose} className="p-1 -mr-2 shadow-none rounded-full h-8 w-8 flex items-center justify-center">
                    <X size={16} />
                  </Button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

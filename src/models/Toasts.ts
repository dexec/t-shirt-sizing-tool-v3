import { POSITION, useToast } from "vue-toastification";
const toast = useToast()

function defaultSuccessToast(message: String) {
  toast.success(message, {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}

function defaultErrorToast(message: String) {
  toast.error("Das Bucket darf keinen leeren String haben!", {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}
function successToastBucketAdded() {
  defaultSuccessToast("Neues Bucket hinzugefügt!");
}

function successToastBucketsSwapped() {
  defaultSuccessToast("Buckets getauscht!")
}

function successToastBucketDeleted(name: string) {
  defaultSuccessToast(`Bucket ${name} gelöscht!`)
}

function successToastBucketRenamed() {
  defaultSuccessToast("Bucket umbenannt!")
}
function errorToastBucketEmptyName() {
  defaultErrorToast("Das Bucket darf keinen leeren String haben!")
}

function errorToastBucketDuplicateName(name: String) {
  defaultErrorToast(`Das Bucket ${name} gibt es schon!`)
}

function errorToastPaketNrNotUnique() {
  defaultErrorToast("Die Ticket-Nr muss eindeutig sein!")
}

function errorToastPaketNrEmpty() {
  defaultErrorToast("Die Ticket-Nr darf nicht leer sein!")
}

export {
  errorToastBucketEmptyName,
  errorToastBucketDuplicateName,
  successToastBucketAdded,
  successToastBucketDeleted,
  successToastBucketsSwapped,
  successToastBucketRenamed,
  errorToastPaketNrNotUnique,
  errorToastPaketNrEmpty
}
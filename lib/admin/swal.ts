import Swal from "sweetalert2";

export async function confirmDelete(message = "Yakin ingin menghapus data ini?") {
  const result = await Swal.fire({
    title: "Konfirmasi Hapus",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  });
  return result.isConfirmed;
}

export async function showSuccess(message: string, title = "Berhasil") {
  await Swal.fire({
    title,
    text: message,
    icon: "success",
    confirmButtonText: "OK",
    customClass: {
      popup: "swal2-popup",
      title: "swal2-title",
      content: "swal2-content",
    },
  });
}

export async function showError(message: string, title = "Gagal") {
  await Swal.fire({
    title,
    text: message,
    icon: "error",
    confirmButtonText: "OK",
    customClass: {
      popup: "swal2-popup",
      title: "swal2-title",
      content: "swal2-content",
    },
  });
}

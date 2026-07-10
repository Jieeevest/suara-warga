import type { Candidate, Resident, User } from "./types";

export const INITIAL_RESIDENTS: Resident[] = [
  {"id":"1f72c7e3-3cab-45f6-808a-647a8d565389","nik":"3674016804750004","name":"AAN NURHAYANI","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Ibu Rumah Tangga","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"ec2a3f0f-2cad-48e6-a4b9-cf3e0dccb195","nik":"3671062108910006","name":"ACHMAD ICHSAN ALKAMIL","email":"","birthPlace":"JAKARTA","gender":"Laki-laki","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"1b567159-5316-4f94-876c-b1687ac8216a","nik":"3674015708590001","name":"AGUSTULASTARI","email":"","birthPlace":"SEMARANG","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG","occupation":"Ibu Rumah Tangga","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"2b42612c-33c4-4491-8ef6-a2ca5171b051","nik":"3671131408820002","name":"ARIA BASUKI","email":"","birthPlace":"JAKARTA","gender":"Laki-laki","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"4ba2e270-0618-4c75-8175-e2152c6bdc91","nik":"3674031802530003","name":"ARINDA HUTABARAT","email":"","birthPlace":"SEMARANG","gender":"Laki-laki","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Pegawai BUMN / BUMD","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"5670d403-f209-4627-9b94-95873143cd13","nik":"3674015601790003","name":"ASTRI KUSHANDAYANI","email":"","birthPlace":"CIREBON","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"9b2a5795-921e-4e8f-bc98-4686aacc13bf","nik":"3674016107740002","name":"ATIK HARTATI","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"9348f053-1adf-491b-8de9-123d46aef2ff","nik":"3671060905740006","name":"BUDI DJATMIKO","email":"","birthPlace":"PEKALONGAN","gender":"Laki-laki","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"3d900419-c8e8-4a10-b21f-b72d5daaef01","nik":"3674021009690007","name":"DJAJA UTAMA","email":"","birthPlace":"JAKARTA","gender":"Laki-laki","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Wiraswasta/Pengusaha","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"e222e595-d32d-49b7-960b-88368174bd13","nik":"3674011508650008","name":"HENDRA AGUSNI","email":"","birthPlace":"BANDUNG","gender":"Laki-laki","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Pensiunan","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"b238105d-ae4d-4e3c-8e37-6e35266b4e3d","nik":"3173027101500001","name":"HJ ENTJAH SADIYAH","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Wiraswasta/Pengusaha","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"cf15d1e4-c38d-42a6-9fb8-00a1bffb5c1b","nik":"3674066101520007","name":"IDA RACHMAWATI","email":"","birthPlace":"MALANG","gender":"Perempuan","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"0fe0988e-4e68-4d96-8508-ca49fb970eca","nik":"3671122710570002","name":"JACOBUS AMIN DELAROSA","email":"","birthPlace":"SUNGAI LIAT","gender":"Laki-laki","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"b40963a1-b29b-48cb-8475-da122c733433","nik":"3671016003610003","name":"JULIASIH WIDJAJA","email":"","birthPlace":"TANGERANG","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG","occupation":"Ibu Rumah Tangga","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"f1654711-7235-4752-ac41-0bac7beab7e0","nik":"3674035903780004","name":"LAURENTIA ARIANTI S","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"575d2cec-cbf4-4a42-9a47-2841987b4315","nik":"3671011403410001","name":"LUKAS KUSMANA","email":"","birthPlace":"TANGERANG","gender":"Laki-laki","identityIssuedPlace":"KOTA TANGERANG","occupation":"PEMUKA AGAMA","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"a09ff60e-f429-45ce-aa99-1e7daa714f30","nik":"3671066305910002","name":"MEYZA GERSIA KUSUMA","email":"","birthPlace":"TANGERANG","gender":"Perempuan","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"ef33eb0f-d854-4960-a3d9-0db21eb76388","nik":"3674010807070001","name":"MOHAMAD REZKY ALFAZRI","email":"","birthPlace":"TANGERANG","gender":"Laki-laki","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"b27b703e-f9df-4df3-b899-12d8ddc7b54e","nik":"3674011410700005","name":"MUHAMAD FAIZAL","email":"","birthPlace":"PALEMBANG","gender":"Laki-laki","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"24910c13-f427-47ba-94f4-f0fe78ba18b7","nik":"3671042101910001","name":"PANJI HERVIYANA","email":"","birthPlace":"TANGERANG","gender":"Laki-laki","identityIssuedPlace":"KOTA TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"6a2fd0e9-778f-4cf6-81b9-42234894de40","nik":"3671065808890002","name":"PUTRI NANDA RUSTIANTI","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"c448182e-52e5-4645-84f5-b117496b1fbf","nik":"3671122309770001","name":"RONI IRAWAN","email":"","birthPlace":"CEPU","gender":"Laki-laki","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"7e7c7f32-9897-4f5e-bf13-35d841de22c2","nik":"3674016711730002","name":"S.HARTATI KUSUMASARI","email":"","birthPlace":"BOYOLALI","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Lainnya","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"c6350926-aacf-4762-a051-85b81103bf56","nik":"3674014401650001","name":"SITI RUKYATUL HILALI","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Pensiunan","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"67f2210d-5d7f-4a88-bf1a-0e7dfb664343","nik":"3674011407660001","name":"SUGI TRISNA","email":"","birthPlace":"KARAWANG","gender":"Laki-laki","identityIssuedPlace":"KOATA TANGHERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"d35bc6d8-e2c3-491a-a5b1-249868a35183","nik":"3671064504800001","name":"SUYATMI","email":"","birthPlace":"KEBUMEN","gender":"Perempuan","identityIssuedPlace":"TANGERANG","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"6a92c892-3758-46f5-8fa5-7e395843d7db","nik":"3674064811810006","name":"SYEH NOVITA","email":"","birthPlace":"JAKARTA","gender":"Perempuan","identityIssuedPlace":"TANGERANG SELATAN","occupation":"Pegawai Swasta","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"164d10a8-c909-4b4b-90d4-dd37a90ec99a","nik":"7605031904850001","name":"TRI SUHARMAN","email":"","birthPlace":"LAKKADING","gender":"Laki-laki","identityIssuedPlace":"KOTA TANGERANG","occupation":"Guru/Dosen","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"8c6a44ff-6fd9-49d1-9ef9-3570ed84ae61","nik":"3674064310700002","name":"UPIK SISTIANINGTYAS","email":"","birthPlace":"SURAKARTA","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG SELATAN","occupation":"Wiraswasta/Pengusaha","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
  {"id":"86ac447a-ef45-458c-8033-a812126e5e94","nik":"3674014202780001","name":"ZIZITA TIANA","email":"","birthPlace":"PADANG","gender":"Perempuan","identityIssuedPlace":"KOTA TANGERANG","occupation":"Ibu Rumah Tangga","address":"","rt":"","rw":"","phoneNumber":"","status":"Aktif","block":"","hasVoted":false,"isPresent":false},
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    number: 1,
    name: "H. Ahmad Sobari",
    vision: "Mewujudkan lingkungan RW 05 yang aman, bersih, dan religius.",
    mission: "1. Mengaktifkan Siskamling.\n2. Program Jumat Bersih.",
    imageUrl: "https://i.pravatar.cc/300?u=ahmad",
    voteCount: 0,
  },
  {
    id: "c2",
    number: 2,
    name: "Ir. Joko Susilo",
    vision: "RW 05 Digital dan Transparan.",
    mission: "1. Laporan keuangan online.\n2. WiFi gratis di pos ronda.",
    imageUrl: "https://i.pravatar.cc/300?u=joko",
    voteCount: 0,
  },
  {
    id: "c3",
    number: 3,
    name: "Ibu Linda Kusuma, S.Pd",
    vision: "Pemberdayaan Keluarga dan Kesehatan Lingkungan.",
    mission: "1. Optimalisasi Posyandu.\n2. Bank Sampah Mandiri.",
    imageUrl: "https://i.pravatar.cc/300?u=linda",
    voteCount: 0,
  },
];

export const getInitialUsers = (): User[] => [
  {
    id: "super-admin",
    name: "Super Administrator",
    role: "super_admin",
    username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
    password: process.env.SUPER_ADMIN_PASSWORD || "superadmin",
  },
];

import multer from 'multer';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

export const uploadImage = upload.single('profilePic');

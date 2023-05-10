import * as uuid from "uuid";
import path from "path";
import fs from "fs";

class FileService {
    save(file, pathTodirectory) {
        const extension = "." + file.name.split(".").at(-1);
        const fileName = uuid.v4() + extension;
        const filePath = path.resolve("static" + pathTodirectory, fileName);
        file.mv(filePath);
        return fileName;
    }

    delete(fileName, pathTodirectory) {
        const filePath = path.resolve("static", pathTodirectory, fileName);
        fs.unlink(filePath, (err) => {
            if (err) {
                throw new Error(err);
            }
        });
    }
}

export default new FileService();

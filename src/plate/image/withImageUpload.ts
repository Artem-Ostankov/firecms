import { WithOverride } from '@udecode/plate-core'

import { insertImage } from './transforms/insertImage'
import { isImageUrl } from './utils/isImageUrl'
import { WithImageUploadOptions } from './types'

/**
 * Allows for pasting images from clipboard.
 * Not yet: dragging and dropping images, selecting them through a file system dialog.
 * @param options.type
 * @param options.uploadImage
 */
export const withImageUpload =
  ({ uploadImage }: WithImageUploadOptions = {}): WithOverride =>
  editor => {
    const { insertData } = editor

    editor.insertData = (data: DataTransfer) => {
      const text = data.getData('text/plain')
      const { files } = data
      if (files && files.length > 0) {
        // @ts-ignore
        for (const file of files) {
          const reader = new FileReader()
          const [mime] = file.type.split('/')

          if (mime === 'image') {
            reader.addEventListener('load', async () => {
              if (!reader.result) {
                return
              }
              const uploadedUrl = uploadImage ? await uploadImage(reader.result) : reader.result

              insertImage(editor, uploadedUrl)
            })

            reader.readAsDataURL(file)
          }
        }
      } else if (isImageUrl(text)) {
        insertImage(editor, text)
      } else {
        insertData(data)
      }
    }

    return editor
  }

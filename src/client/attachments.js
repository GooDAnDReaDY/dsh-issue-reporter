    function renderAttachmentDropzone({ h, t, isDragging, setIsDragging, addFiles, fileInputRef, attachments, setAttachments }) {
    const dropzone = h('div', {
      className: 'ir-dropzone' + (isDragging ? ' ir-dropzone-active' : ''),
      onDragOver: (e) => { e.preventDefault(); setIsDragging(true) },
      onDragLeave: (e) => { e.preventDefault(); setIsDragging(false) },
      onDrop: (e) => {
        e.preventDefault(); setIsDragging(false)
        const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'))
        if (files.length) addFiles(files)
      },
      onClick: () => fileInputRef.current?.click(),
    }, [
      h('input', {
        ref: fileInputRef,
        type: 'file',
        accept: 'image/png,image/jpeg,image/gif,image/webp',
        multiple: true,
        style: { display: 'none' },
        onChange: async (e) => {
          const files = Array.from(e.currentTarget.files || [])
          e.currentTarget.value = ''
          if (files.length) await addFiles(files)
        },
      }),
      h('div', { className: 'ir-dropzone-text' }, [
        h('strong', { style: { display: 'block', marginBottom: 4 } }, '📸 ' + t.attachments),
        h('span', null, t.dropzonePrompt),
      ]),
      attachments.length ? h('div', { className: 'ir-thumbs-grid', onClick: (e) => e.stopPropagation() },
        attachments.map((att, idx) => h('div', { key: att.name + '-' + idx, className: 'ir-thumb-card' }, [
          att.previewUrl ? h('img', { src: att.previewUrl, alt: att.name, className: 'ir-thumb-img' }) : null,
          h('button', {
            type: 'button',
            className: 'ir-thumb-del',
            title: t.removeAttachment,
            onClick: () => setAttachments(attachments.filter((_, i) => i !== idx)),
          }, '×'),
          h('span', { className: 'ir-thumb-meta' }, Math.round(att.size / 1024) + ' KB'),
        ]))
      ) : null,
    ])
      return dropzone
    }

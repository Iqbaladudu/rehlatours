import { CollectionConfig } from 'payload'

export const UmrahPackage: CollectionConfig = {
  slug: 'umrah-package',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Paket',
    },
    {
      name: 'price',
      type: 'number',
      required: false,
      label: 'Harga Paket (Rp)',
      min: 0,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi Paket',
    },
    {
      name: 'duration',
      type: 'text',
      required: false,
      label: 'Durasi',
    },
    {
      name: 'includes',
      type: 'array',
      label: 'Fasilitas',
      fields: [
        {
          name: 'facility',
          type: 'text',
          required: false,
          label: 'Fasilitas',
        },
      ],
    },
  ],
}

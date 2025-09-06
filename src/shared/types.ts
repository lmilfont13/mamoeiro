import z from "zod";

export const ContainerSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  container_number: z.string(),
  departure_port: z.string(),
  arrival_port: z.string(),
  departure_date: z.string().nullable(),
  expected_arrival_date: z.string().nullable(),
  actual_arrival_date: z.string().nullable(),
  status: z.enum(['pending', 'departed', 'in_transit', 'arrived', 'delayed']),
  cargo_description: z.string().nullable(),
  tracking_number: z.string().nullable(),
  shipping_line: z.string().nullable(),
  notes: z.string().nullable(),
  product_images: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateContainerSchema = z.object({
  container_number: z.string().min(1, 'Número do container é obrigatório'),
  departure_port: z.string().min(1, 'Porto de saída é obrigatório'),
  arrival_port: z.string().min(1, 'Porto de chegada é obrigatório'),
  departure_date: z.string().optional(),
  expected_arrival_date: z.string().optional(),
  status: z.enum(['pending', 'departed', 'in_transit', 'arrived', 'delayed']).default('pending'),
  cargo_description: z.string().optional(),
  tracking_number: z.string().optional(),
  shipping_line: z.string().optional(),
  notes: z.string().optional(),
  product_images: z.string().optional(),
});

export const UpdateContainerSchema = CreateContainerSchema.partial();

export type Container = z.infer<typeof ContainerSchema>;
export type CreateContainer = z.infer<typeof CreateContainerSchema>;
export type UpdateContainer = z.infer<typeof UpdateContainerSchema>;

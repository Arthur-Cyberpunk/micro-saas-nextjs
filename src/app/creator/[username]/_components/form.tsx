"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPayment } from "../_actions/create-payment";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  message: z.string().min(1, "A mensagem é obrigatória"),
  price: z.enum(["15", "25", "35"], {
    required_error: "O valor é obrigatório",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface FormDonateProps {
  creatorId: string;
  slug: string;
}

export function FormDonate({ slug, creatorId }: FormDonateProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      price: "15",
    },
  });

  async function onSubmit(data: FormData) {
    const priceInCents = Number(data.price) * 100; // Valor em centavos

    const checkout = await createPayment({
      name: data.name,
      message: data.message,
      creatorId: creatorId,
      slug: slug,
      price: priceInCents,
    });

    await handlePaymentResponse(checkout);
  }

  async function handlePaymentResponse(checkout: {
    url?: string;
    error?: string;
  }) {
    if (checkout.error) {
      toast.error(checkout.error);
      return;
    }

    if (!checkout.url) {
      toast.error("Falha ao criar o pagamento, tente mais tarde.");
      return;
    }

    window.location.href = checkout.url;
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm h-fit">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
          Apoiar
        </CardTitle>

        <CardDescription>
          Sua contribuição ajuda a manter o conteúdo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome..."
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      {...field}
                      className="bg-white h-32 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da doação</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center gap-3"
                    >
                      {["15", "25", "35"].map((value) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem value={value} id={value} />
                          <Label className="text-lg" htmlFor={value}>
                            R$ {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Carregando..." : "Fazer doação"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

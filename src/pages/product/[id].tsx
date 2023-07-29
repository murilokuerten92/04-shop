import { stripe } from "@/lib/stripe";
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product";
import { GetStaticProps, GetStaticPaths } from 'next'
import Stripe from "stripe";
import Image from 'next/image'
import axios from "axios";
import { useState } from "react";

interface ProductProps {
    product: {
        id: string;
        name: string;
        imageUrl: string;
        price: string;
        description: string;
        defaultPriceId: string;
    }
}

export default function Product({ product }: ProductProps) {

    const [isCreationCheckoutSession, setIsCreationCheckoutSession] = useState(false)

    async function handleBuyProduct() {

        try {

            setIsCreationCheckoutSession(true)

            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId
            })

            const { checkoutUrl } = response.data;

            window.location.href = checkoutUrl

        } catch (error) {

            setIsCreationCheckoutSession(false)

            alert('Falha ao redirecionar ao checkout')
        }
    }

    return (
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageUrl} width={520} height={480} alt='' />
            </ImageContainer>

            <ProductDetails>
                <h1>{product.name}</h1>
                <span>{product.price}</span>

                <p>{product.description}</p>

                <button disabled={isCreationCheckoutSession} onClick={handleBuyProduct}>
                    Comprar agora
                </button>
            </ProductDetails>
        </ProductContainer>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [{
            params: { id: 'prod_OIIthi8HvQ96qF' }
        }],
        fallback: true
    }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {

    const productId = params!.id

    const product = await stripe.products.retrieve(productId, {
        expand: ['default_price']
    })

    const price = product.default_price as Stripe.Price

    const oneHour = 60 * 60 * 1

    return {
        props: {
            product: {
                id: product.id,
                name: product.name,
                imageUrl: product.images[0],
                price: new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(Number(price.unit_amount) / 100),
                description: product.description,
                defaultPriceId: price.id
            }
        },
        revalidate: oneHour
    }
}
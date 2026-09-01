import Link from "next/link";

interface Props {

  href:string;

  image:string;

  alt:string;

  className?:string;

}


export default function DeskObject({

href,
image,
alt,
className=""

}:Props){


return (

<Link

href={href}

className={`desk-object ${className}`}

>


<img

src={image}

alt={alt}

/>


</Link>

)

}

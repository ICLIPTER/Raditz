import Title from "../components/Title";

const Generator = () => {
  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your model and product images to generate stunning UGC, short-form videos and social media posts"
        />

        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/* left col */}
          <div className="">
            <p>Left Col</p>
          </div>
          {/* right col */}
          <div>
            <p>Right Col</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Generator;

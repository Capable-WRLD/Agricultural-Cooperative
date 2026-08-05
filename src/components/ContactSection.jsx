function ContactSection() {
  return (
    <section
      id="contact"
      className="container py-5"
    >

      <h2 className="text-center text-success mb-5">
        Contact Us
      </h2>

      <div className="glass-card p-5">

        <div className="row">

          <div className="col-md-6">

            <h5>Email</h5>
            <p>capablewrld999@gmail.com</p>

            <h5>Phone</h5>
            <p>+234 8145 088 769</p>

            <h5>Address</h5>
            <p>Ogbomosho, Nigeria</p>

          </div>

          <div className="col-md-6">

            <input
              className="form-control mb-3"
              placeholder="Your Name"
            />

            <input
              className="form-control mb-3"
              placeholder="Email"
            />

            <textarea
              className="form-control"
              rows="5"
              placeholder="Message"
            />

          </div>

        </div>

      </div>

    </section>
  );
}

export default ContactSection;
const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://fir-esf-test-default-rtdb.firebaseio.com/",
});

const db = admin.database();

function sendWelcomeMail(email, firstname) {
  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      
    },
  });

  return transport
    .sendMail({
      from: "Exploradores Sem Fronteiras <esf.firebase@gmail.com>",
      to: email,
      subject: "Se inscreva em nosso canal do YouTube! 🎥🌎",
      html: `
        <h1>Olá, ${firstname}</h1>
        <p>Muito obrigado por preencher nosso formulário. Abaixo seguem os links de nossas redes sociais. Siga-nos e fique por dentro de todas as novidades!</p>
      `,
    })
    .then((response) => {
      console.log("E-mail enviado com sucesso:", response);
      return null;
    })
    .catch((error) => {
      console.error("Erro ao enviar o e-mail:", error);
      return null;
    });
}

router.get("/", (req, res) => {
  db.ref("contacts").once("value", (snapshot) => {
    const data = snapshot.val();
    res.render("index", { contacts: data });
  });
});

router.post("/new-contact", (req, res) => {
  const newContact = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    whatsapp: req.body.whatsapp,
  };
  db.ref("contacts")
    .push(newContact)
    .then(() => {
      return sendWelcomeMail(newContact.email, newContact.firstname);
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Erro ao adicionar o contato:", error);
      res.status(500).send("Erro ao adicionar o contato.");
    });
});

module.exports = router;

import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { Alert } from "react-bootstrap";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getNewsDetails } from "../api/adapters";
import { getNewsDetailsEndpoint } from "../api/endpoints";
import { Layout } from "../components/Layout";
import { addToFavorites } from "../store/Favorites/actions";
import { FavoritesContext } from "../store/Favorites/context";
import { getFormattedDate } from "../utils/date";
import { useFetch } from "../utils/hooks/useFetch";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import styles from "./NewsDetails.module.css";

export function NewsDetails() {
  const params = useParams();
  const newsId = params.newsId + "/" + params["*"];

  const { favoritesState, favoritesDispatch } = useContext(FavoritesContext);

  const newsDetailsEndpoint = getNewsDetailsEndpoint(newsId);

  const newsDetails = useFetch(newsDetailsEndpoint);

  const adaptedNewsDetails = getNewsDetails(newsDetails);

  // Adaugam un state pentru afisarea alertei.
  const [isAlertDisplayed, setIsAlertDisplayed] = useState(false);
  // Extragem functia de modificare a localStorage-ului. Nu avem nevoie de state-ul din localStorage, conventia este ca pentru variabile neutilizate sa punem denumirea _.
  // Comentariul eslint-disable-next-line dezactiveaza eslint pentru urmatoarea linie (sa nu se planga ca nu utilizam variabila _).
  // eslint-disable-next-line
  const [_, setLocalStorageState] = useLocalStorage(
    "favorites",
    favoritesState
  );
  // Adaugarea in localStorage este un efect, atunci cand se modifica produsele favorite.
  // Cum strim ca s-au modificat produsele favorite? Primim o noua valoare a lui favoritesState.
  // setLocalStorageState este sugerat sa fie adaugat la dependente de o regula de lining.
  useEffect(() => {
    setLocalStorageState(favoritesState);
  }, [favoritesState, setLocalStorageState]);

  const { title, description, image, date, author, content, thumbnail } =
    adaptedNewsDetails;

  const handleAddToFavorites = () => {
    const newsItem = {
      id: newsId,
      image: thumbnail,
      title,
      description,
      hasDeleteButton: true,
    };

    const actionResult = addToFavorites(newsItem);
    favoritesDispatch(actionResult);

    // Afisam alerta.
    setIsAlertDisplayed(true);
    // Imediat ce afisam alerta, declansam un timer, care in 2 secunde va ascunde alerta.
    setTimeout(() => {
      setIsAlertDisplayed(false);
    }, 2000);
  };

  return (
    <Layout>
      {/* Afisam conditionat alerta */}
      {isAlertDisplayed && (
        <Alert variant='success' id={styles.alert}>
          Succes! Poți vedea știrea accesând secțiunea Favorite.
        </Alert>
      )}
      <Container className={`${styles.newsDetails} text-start my-5`}>
        <Row className='justify-content-center'>
          <Col xs={12} lg={8}>
            <h1 className='my-5'>{title}</h1>
            <p className='fw-bold'>{description}</p>
            <div dangerouslySetInnerHTML={{ __html: image }} className='mb-4' />
            <div className='d-flex justify-content-between align-items-center mb-4'>
              <div className='fw-bold'>
                <p>{author}</p>
                <p>{getFormattedDate(date)}</p>
              </div>
              <Button variant='success' onClick={handleAddToFavorites}>
                Adauga la favorite
              </Button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

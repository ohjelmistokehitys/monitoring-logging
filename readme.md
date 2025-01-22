# Docker Compose ja PostgreSQL

Tämän tehtävän tavoitteena on perehtyä Dockerin ja Docker Compose:n keskeisiin käsitteisiin ja ominaisuuksiin, kuten volumet, portit ja ympäristömuuttujat. Samalla pääsemme työskentelemään PostgreSQL:n ja pgAdminin kaltaisten "oikeiden" työkalujen kanssa.

Käsittelemme tässä tehtävässä [**PostgreSQL**-tietokantaa](https://hub.docker.com/_/postgres) ja [**pgAdmin**-hallintatyökalua](https://www.pgadmin.org/), mutta samoja periaatteita voidaan soveltaa myös muiden tietokantojen yhteydessä. Tehtävä onkin melko samankaltainen kuin [PostgreSQL:n Docker-imagen dokumentaatiossa esitetty Docker compose -esimerkki](https://hub.docker.com/_/postgres) sekä Dockerin blogitekstissä esitetty [How to Use the Postgres Docker Official Image](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/) -esimerkki. Selkeimpänä erona tässä tehtävässä käytetään tietokannan hallintaan pgAdmin-työkalua, kun edellä mainituissa työkaluna on [Adminer](https://hub.docker.com/_/adminer/).


## Suositeltua taustamateriaalia

* [How to Use the Postgres Docker Official Image (docker.com)](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/)
* [`docker compose` CLI reference (docker.com)](https://docs.docker.com/reference/cli/docker/compose/)
* [Compose file reference (docker.com)](https://docs.docker.com/reference/compose-file/)
* [DevOps with Docker, part 2 (devopswithdocker.com)](https://devopswithdocker.com/category/part-2)
* [Docker Compose will BLOW your MIND!! (YouTube, NetworkChuck)](https://youtu.be/DM65_JyGxCo)


## Miksi Docker compose?

Docker Compose on usein parempi vaihtoehto kuin erillisten `docker run` -komentojen kirjoittaminen, erityisesti silloin, kun käynnistettäviä palveluita on useita. Docker compose yksinkertaistaa monimutkaisten ympäristöjen hallintaa yksittäisen YAML-tiedoston avulla. Tämä tekee ympäristön pystyttämisestä helpompaa ja vähemmän virhealttiista, kun kaikki konfiguraatiot ja riippuvuudet ovat yhdessä paikassa.

Docker Compose hallitsee volyymit ja verkot automaattisesti ja mm. liittää kaikki samaan tiedostoon määritellyt palvelut osaksi samaa verkkoa, jolloin ne voivat olla vuorovaikutuksessa keskenään. Saman YAML-tiedoston jakaminen esimerkiksi versionhallinnan kautta muiden kanssa on myös sujuvaa, ja se vähentää eroavaisuuksia eri kehittäjien kehitysympäristöissä sekä muissa ympäristöissä.


## PostgreSQL

PostgreSQL on suosittu avoimen lähdekoodin relaatiotietokanta, jota voidaan käyttää hyvin monenlaisissa eri käyttötarkoituksissa:

> *PostgreSQL, often simply "Postgres", is an object-relational database management system (ORDBMS) with an emphasis on extensibility and standards-compliance. As a database server, its primary function is to store data, securely and supporting best practices, and retrieve it later, as requested by other software applications, be it those on the same computer or those running on another computer across a network (including the Internet). It can handle workloads ranging from small single-machine applications to large Internet-facing applications with many concurrent users.*
>
> What is PostgreSQL? https://hub.docker.com/_/postgres

PostgreSQL löytyy valmiina Docker-imagena Docker Hub -konttirekisteristä: https://hub.docker.com/_/postgres. Tässä tehtävässä sinun tarvitsee vain hyödyntää valmista imagea ja tutustua sen dokumentaatioon. Dockerfile-tiedostoja ei tässä harjoituksessa tarvita.


# Tehtävä: tietokantapalvelimen sekä hallintakäyttöliittymän asennus

Kehittäessäsi sovellusta tarvitset usein erillisen tietokannan, joka sisältää testidataa, joten voit huoletta muuttaa sitä ilman vaikutuksia muihin käyttäjiin tai kehittäjiin. Tässä tehtävässä luot Docker Compose -tiedoston avulla ympäristön, jossa PostgreSQL toimii kontissa, tietokanta alustetaan haluttuun alkutilaan, data pysyy säilytettynä kontin elinkaaresta riippumatta ja pääset hallitsemaan tietokantaa pgAdmin-nimisen työkalun avulla.

> *"While it’s possible to use the Postgres Official Image in production, Docker Postgres containers are best suited for local development. This lets you use tools like Docker Compose to collectively manage your services. You aren’t forced to juggle multiple database containers at scale, which can be challenging."*
>
> Tyler Charboneau, 2022. [How to Use the Postgres Docker Official Image](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/)

Tämän tehtävän Docker Compose -asetelma soveltuu hyvin **kehitysympäristöihin**, joissa tarvitset nopeasti käyttöön otettavan tietokannan. Tietokantojen kontittamisesta tuotantoympäristöissä on olemassa eriäviä näkemyksiä. Jotkut kannattavat konttien käyttöä tietokannoille tuotannossa, koska kontit ovat helposti siirrettäviä ja skaalautuvia. Toiset taas vastustavat ajatusta, sillä tietokannat saattavat vaatia monimutkaisempaa hallintaa ja suorituskykyä, mikä voi olla haaste konttipohjaisessa ympäristössä.


## docker-compose.yml

Tästä tehtävärepositoriosta löytyy valmiiksi [docker-compose.yml](./docker-compose.yml)-tiedosto, johon kirjoitetaan kaikki tämän tehtävän Docker-määritykset. Kokeile ratkaisujesi toimivuutta aina ensin `docker compose up` -komennolla ja sulje palvelut `docker compose down`-komennolla ennen seuraavaa kokeilua. Löydät muut mahdolliset komennot [`docker compose`-komennon dokumentaatiosta](https://docs.docker.com/reference/cli/docker/compose/).

[docker-compose.yml](./docker-compose.yml)-tiedostosta löytyy valmiiksi kaksi palvelua: `postgres` ja `pgadmin`:

```yaml
services:
  postgres:
    image: postgres:latest        # https://hub.docker.com/_/postgres
    container_name: database

  pgadmin:
    image: dpage/pgadmin4:latest  # https://hub.docker.com/r/dpage/pgadmin4/
    container_name: database-admin
```

Molemmat **palvelut** perustuvat valmiiseen Docker-imageen. Palveluiden nimet (`postgres` ja `pgadmin`) ovat vapaasti valittavissa, ja palvelut voivat ottaa yhteyksiä toisiinsa näiden nimien avulla:

> *"By default, any service can reach any other service at that service's name."*
>
> https://docs.docker.com/compose/networking/#link-containers

`container_name` puolestaan määrittelee nimen, jolla voit itse suorittaa esimerkiksi Docker-komentoja käynnissä oleville konteille.


## Osa 1: palveluiden käynnistäminen ja ympäristömuuttujat (20 %)

Kokeile käynnistää [docker-compose.yml](./docker-compose.yml)-tiedostossa määritellyt palvelut `docker compose up`-komennolla. Huomaat, että kumpikaan palvelu ei käynnisty, koska niille ei ole määritetty välttämättömiä **ympäristömuuttujia**, kuten salasanoja.

Tutustu PostgreSQL:n Docker-imagen dokumentaatioon osoitteessa https://hub.docker.com/_/postgres sekä pgAdmin 4:n dokumentaatioon osoitteessa https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html. Näistä lähteistä löydät vaadittavat **ympäristömuuttujat**, jotka täytyy määritellä kontteja käynnistettäessä. Määrittele siis [docker-compose.yml](./docker-compose.yml)-tiedostoon kummallekin palvelulle [`environment`-lohkot](https://docs.docker.com/reference/compose-file/services/), joihin lisäät dokumentaatioissa mainitut vaaditut ympäristömuuttujat. Löydät vinkit vaadituista ympäristömuuttujista myös `docker compose up`-komennon tuottamista virheilmoituksista. Valinnaisia ympäristömuuttujia ei tarvitse asettaa, joten yksinkertaisimmillaan muuttujia tarvitsee määritellä vain muutama.

Kun olet asettanut vaaditut ympäristömuuttujat, suorita `docker compose up`-komento uudestaan. `database`-kontin pitäisi nyt tulostaa lokiin teksti `database system is ready to accept connections` ja `database-admin` pitäisi tulostaa `[INFO] Listening at: http://[::]:80 (1)`. Huomaa, että pgAdmin-kontin ensimmäinen käynnistys vie melko kauan aikaa.

💡 *Salasanojen ja käyttäjätunnusten tallentaminen YAML-tiedostoon ja niiden lisääminen versionhallintaan on yleisesti ottaen huono idea. Korjaamme tämän ongelman tehtävän myöhemmässä osassa.*


## Osa 2: volumet (20 %)

Haluamme seuraavaksi, että postgreSQL-tietokannan data säilyy tallessa konttien pysäyttämisestä tai poistamisesta riippumatta. Tämä onnistuu käyttämällä Dockerin **volumea**, joka säilyttää tiedot host-järjestelmässä.

Määrittele siis tietokantapalvelulle `volume`, jossa kontin sisään polkuun `/var/lib/postgresql/data` liitetään kontin ulkopuolinen volume. Näin tietokannan tiedot säilyvät myös mahdollisen kontin poistamisen jälkeen. Löydät lisää ohjeita tähän esimerkiksi artikkelista [How to Use the Postgres Docker Official Image](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/).

PostgreSQL mahdollistaa tietokannan alustamisen automaattisesti, kun se käynnistetään ensimmäistä kertaa. Tästä ominaisuudesta käytetään dokumentaatiossa termiä **initialization script**. Käytännössä kontti käy ensimmäistä kertaa käynnistyessään läpi tietyssä hakemistossa olevat sql-, ja sh-skriptit, joiden avulla saamme alustettua tietokannan sisällön haluttuun alkutilaan:

> *"If you would like to do additional initialization in an image derived from this one, add one or more \*.sql, \*.sql.gz, or \*.sh scripts under /docker-entrypoint-initdb.d (creating the directory if necessary). After the entrypoint calls initdb to create the default postgres user and database, it will run any \*.sql files, run any executable \*.sh scripts, and source any non-executable \*.sh scripts found in that directory to do further initialization before starting the service."*
>
> Initialization scripts. https://hub.docker.com/_/postgres

Tässä tehtävässä haluamme lisätä tietokantapalvelimelle automaattisesti **Chinook-esimerkkitietokannan**, jonka luontiskripti löytyy valmiiksi tämän repositorion [`sql`-hakemistosta](./sql/). Liitä siis host-koneen `./sql`-hakemisto tietokantapalvelun sisään hakemistoksi `/docker-entrypoint-initdb.d/`, jolloin tietokanta alustetaan automaattisesti.

Lopuksi sulje käynnistämäsi palvelut `docker compose down` -komennolla ja käynnistä ne uudelleen `docker compose up` -komennolla. Tällä kertaa terminaaliin pitäisi ilmestyä lukuisia lokirivejä `postgres`-palvelusta, jossa kerrotaan, että tietokantaan luodaan tauluja ja rivejä (*CREATE TABLE* ja *INSERT*).

> [!TIP]
> Lisää molemmat volumet kerralla YAML-tiedostoon ja käynnistä palvelut vasta sitten. Jos määrittelet ensin `/var/lib/postgresql/data`-volumen ja käynnistät tietokannan, tietokanta alustetaan tyhjäksi, eikä myöhemmillä käynnistyskerroilla alustusskripteillä ole enää vaikutusta. Jos näin pääsi kuitenkin jo käymään, ja tietokanta on alustettu tyhjänä, voit poistaa `/var/lib/postgresql/data`-volumen ja käynnistää palvelut vielä kerran uudelleen.


## Osa 3: `exec`, `psql` ja tietokantakyselyt (20 %)

Edellisessä kohdassa käytetty **Chinook** on avoimella [MIT-lisenssillä](https://github.com/lerocha/chinook-database/blob/master/LICENSE.md) julkaistu esimerkkitietokanta, joka sisältää musiikkikaupan tietoja, kuten artisteja, albumeita, kappaleita ja asiakkaita. Se on suunniteltu tarjoamaan realistinen mutta yksinkertainen tietokantarakenne, joka on hyödyllinen SQL-kyselyiden ja tietokannan hallinnan harjoitteluun. Tässä tehtävässä Chinook-tietokantaa käytetään, koska sen sisältö on monipuolinen ja helposti ymmärrettävä.

Kun olet käynnistänyt [docker-compose.yml](./docker-compose.yml)-tiedostossa määritellyt kontit, ne näkyvät Dockerin komennoilla aivan kuten ilman composea käynnistetyt kontit. Suorita siis `docker ps`-komento ja varmista, että kontit ovat käynnissä. PostgreSQL-kontin nimeksi (*container_name*) on YAML-tiedostossa määritetty `database`, joten voit käynnistää itsellesi bash-komentorivin kyseisen kontin sisälle seuravalla komennolla:

```
docker exec -it database /bin/bash
root@a1b2c3d4:/#
```

PostgreSQL-tietokannan käyttämiseksi komentorivillä voidaan hyödyntää `psql`-työkalua. `psql` mahdollistaa mm. kyselyiden suorittamisen ja muiden tietokantaoperaatioiden tekemisen komentoriviltä, mikä on usein hyödyllistä erityisesti kehitysvaiheessa. `psql` tulee valmiiksi asennettuna PostgreSQL:n virallisessa Docker-imagessa.

Kun olet saanut bash-komentokehotteen auki, eli näet yllä olevaa esimerkkiä vastaavan kehotteen, voit käyttää `psql`-työkalua joko interaktiivisessa tilassa tai suorittamalla `-c`-komennolla yksittäisiä kyselyjä. Kokeile suorittaa seuraava kysely, jossa tietokantaan yhdistetään ympäristömuuttujaan määrittelemälläsi `$POSTGRES_USER`-käyttäjätunnuksella, ja `chinook_auto_increment`-tietokannasta etsitään kaikki kappaleet, joiden nimessä esiintyy joko `hello` tai `world`:

```sh
psql -U $POSTGRES_USER -d chinook_auto_increment -c "SELECT name FROM Track WHERE name ILIKE '%hello%' OR name ILIKE '%world%'"
```

**Tallenna komennon tulostama lista kappaleiden nimistä [hello-world.txt](./hello-world.txt)-tiedostoon.**


## Osa 4: porttien avaaminen (20 %)

PostgreSQL-kontti kuuntelee oletuksena porttia **5432** ja pgadmin4-kontti porttia **80**. Julkaise nämä portit konteista host-koneelle asettamalla [docker-compose.yml](./docker-compose.yml)-tiedostoon `ports`-määritykset molemmille palveluille.

> [!TIP]
> Voit käyttää host-koneella mitä vain portteja: niiden ei tarvitse olla samat kuin konttien sisäiset portit. Voit myös määritellä portit kuuntelemaan vain `127.0.0.1`-verkkoa, jolloin näiden konttien ei *pitäisi* näkyä koneesi ulkopuolelle.

Voit nyt kokeilla käynnistää palvelut `docker compose up`-komennolla. Nyt sinulla pitäisi olla pääsy pgAdmin-kontin web-käyttöliittymään verkkoselaimesi avulla käyttämällä host-koneen porttia, jonka määrittelit `database-admin`-palvelulle. Huomaa, että pgadmin-palvelun ensimmäinen käynnistys kestää melko kauan, joten odota vähintään kunnes terminaalissa kerrotaan, että se kuuntelee sisäisesti porttia 80.


## Osa 5: pgAdmin 4

[**pgAdmin 4**](https://www.pgadmin.org/) on web-pohjainen graafinen hallintatyökalu PostgreSQL-tietokannan hallintaan. Sen avulla kehittäjät voivat suorittaa SQL-kyselyitä, tarkastella tietokantatauluja, sekä hallita käyttäjiä ja tietokannan asetuksia ilman tarvetta käyttää esimerkiksi komentorivityökaluja.

> *pgAdmin is a management tool for [PostgreSQL](https://www.postgresql.org/) and derivative relational databases such as [EnterpriseDB's](https://www.enterprisedb.com/) EDB Advanced Server. It may be run either as a web or desktop application. For more information on the features offered, please see the [Features](https://www.pgadmin.org/features/) and [Screenshots](https://www.pgadmin.org/screenshots/) pages.*
>
> What is pgAdmin 4? https://www.pgadmin.org/faq/

Kokeile kirjautua sisään pgAdmin-työkaluun nettiselaimellasi käyttämällä sähköpostiosoitetta ja salasanaa, jotka määrittelit ympäristömuuttujiin. Itse pgAdmin-työkaluun kirjautuminen ei vielä muodosta yhteyttä tietokantaan, vaan yhteys pitää määritellä erikseen. Samassa Docker compose -tiedostossa määritellyt palvelut voivat oletuksena ottaa toisiinsa yhteyksiä suoraan palveluiden nimiä käyttäen, joten käytä tietokannan yhteysosoitteena nimeä `postgres`. Käyttäjätunnuksena sekä salasanana käytä itse edellisissä kohdissa määrittämiäsi tunnuksia.

Löydät ohjeita pgAdmin-työkalun käyttämiseksi hakukoneilla sekä työkalun omasta dokumentaatiosta. Voit aloittaa esimerkiksi videosta [pgAdmin Tutorial - How to Use pgAdmin (YouTube, Database Star)](https://youtu.be/WFT5MaZN6g4?feature=shared&t=160). Tätä tehtävää tehdessäsi sinun ei kuitenkaan tarvitse käyttää pgAdmin-työkalua tietokannan käsittelemiseksi, vaan riittää, että kirjaudut sisään ja saat yhteyden muodostettua onnistuneesti.

🔐 *Tuotantokäytössä tietokantojen hallinta tehdään yleensä muilla tavoilla, kuten komentorivityökaluilla tai automatisoiduilla prosesseilla, eikä graafista käyttöliittymää välttämättä käytetä. Mikäli tuotantopalvelussa olisi käytössä pgAdmin tai vastaava hallintatyökalu, pääsyä siihen kannattaisi rajoittaa erityisen huolellisesti.*


### 🚀 Extra: pgAdmin ja servers.json

Tietokantapalvelimen asetukset on mahdollista lisätä pgAdmin-työkaluun automattisesti siten, että sinun ei tarvitse syöttää niitä käsin web-käyttöliittymään. Tämä onnistuu `/pgadmin4/servers.json`-tiedoston avulla, joka voidaan lisätä konttiin volumena. Löydät lisätietoja `servers.json`-tiedoston käyttämisestä Docker compose -työkalun kanssa [tästä StackOverflow-keskustelusta](https://stackoverflow.com/a/64626964). Voit halutessasi määritellä tietokannan asetukset tiedoston avulla.

Tässä tehtävärepositoriossa on valmiina [servers.json-esimerkkitiedosto](./servers.json), jota voit halutessasi käyttää pohjana. Tiedostoon määritetty käyttäjänimi tulee päivittää, mikäli asetit edellisissä vaiheissa nimeksi muun kuin `postgres`. JSON-tiedoston formaatin kuvaus löytyy [pgAdmin-työkalun omista ohjeista](https://www.pgadmin.org/docs/pgadmin4/latest/import_export_servers.html#json-format).

Huomaa, että `servers.json`-tiedoston muutokset eivät astu voimaan automaattisesti jo olemassa oleviin kontteihin, joten joudut luomaan kontin uudelleen (`docker compose down`) lisättyäsi volumen:

> *"Note that server definitions are only loaded on first launch, i.e. when the configuration database is created, and not on subsequent launches using the same configuration database."*
>
> /pgadmin4/servers.json. https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html#mapped-files-and-directories


## Osa 6: salaisuuksien hallinta .env-tiedoston avulla (20 %)

Salaisuuksien, kuten käyttäjätunnusten ja salasanojen, säilyttäminen suoraan Docker compose -tiedostossa ei ole turvallista, sillä tiedosto on tarkoitus tallentaa versionhallintaan ja sitä on tarkoitus jakaa eri tahojen välillä. Toisaalta eri ympäristöissä tarvitaan myös tyypillisesti eri asetuksia, joten myös siksi on hyvä, että muuttuvaa tietoa ei kovakoodata. Ympäristömuuttujat tuleekin seuraavaksi siirtää `.env`-nimiseen tiedostoon, jota ei lisätä versionhallintaan. `.env` on jo valmiiksi mainittuna tämän tehtävän [.gitignore](./.gitignore)-tiedostossa, joten sen ei pitäisi päätyä versionhallintaan vahingossa.

**Luo uusi .env-niminen tiedosto** tähän hakemistoon ja lisää sinne molempien palveluiden tarvitsemat salaisuudet, esimerkiksi muodossa:

```
# These are just sample passwords, never use them in a real project

# postgres
POSTGRES_USER=null_pointer_expert
POSTGRES_PASSWORD=zt7kYOwBv527uFLj5bf5M3K4SIIhcP01

# pgadmin
PGADMIN_DEFAULT_EMAIL=datasaurus_rex@example.com
PGADMIN_DEFAULT_PASSWORD=Xjyl7THN5Kiz86F7PI7mz1s6Yf436GtD
```

**Päivitä docker-compose.yml-tiedosto** käyttämään ympäristömuuttujia `.env`-tiedostosta. Lisää siis `env_file`-lohkot molemmille palveluille. Korvaa lisäksi kovakoodatut arvot viittauksilla ympäristömuuttujiin, tai voit myös poistaa yksittäiset muuttujat kokonaan YAML-tiedostosta:

```yaml
services:
  postgres:
    image: postgres:latest
    container_name: database

    ...

    env_file: ".env"
...
```

Löydät aiheesta lisää tietoa esimerkiksi [Docker compose:n ohjeista](https://docs.docker.com/compose/environment-variables/set-environment-variables/#use-the-env_file-attribute).

💡 *Docker compose:n avulla voisit käyttää myös eri .env-tiedostoja eri palveluille. Tämän tehtävän automaattisen tarkastamisen kannalta on kuitenkin tärkeää, että käytät vain ja ainoastaan `.env`-nimistä tiedostoa.*


> [!IMPORTANT]
> Jos käytät tässä vaiheessa eri käyttäjätunnuksia tai salasanoja kuin aikaisemmin, joudut mahdollisesti luomaan kontit uudestaan (`docker compose down`) ja poistamaan volumen (`docker volume rm`), jotta muutokset astuvat voimaan. Tämä johtuu siitä, että ympäristömuuttujina annettavia salasanoja käytetään esimerkiksi tietokannan alustuksessa, eikä ympäristömuuttujan vaihtaminen muuta talteen asetettuja käyttäjätietoja.
>
> > *"the Docker specific variables will only have an effect if you start the container with a data directory that is empty; any pre-existing database will be left untouched on container startup.*"
> >
> > postgres. Docker Official Image. https://hub.docker.com/_/postgres


## Ratkaisujen lähettäminen

Kun olet saanut osan tai kaikki tehtävistä ratkaistua ja commitoinut vastauksesi, lähetä ratkaisut arvioitavaksi `git push`-komennolla. Git push käynnistää automaattisesti workflow:n, joka testaa kaikki komentosi ja antaa niistä joko hyväksytyn tai hylätyn tuloksen.

Kun GitHub Actions on saanut ratkaisusi tarkastettua, näet tuloksen GitHub-repositoriosi [Actions-välilehdellä](../../actions/workflows/classroom.yml). Arvioinnin valmistumiseen kuluu tyypillisesti pari minuuttia.

Klikkaamalla yllä olevan linkin takaa viimeisintä "GitHub Classroom Workflow" -suoritusta, saat tarkemmat tiedot tehtävän arvioinnista. Sivun alaosassa näkyy saamasi pisteet. Klikkaamalla "Autograding"-otsikkoa pääset katsomaan tarkemmin arvioinnissa suoritetut vaiheet ja niiden tulokset.


# Lisenssit

## Docker

> "The Docker Engine is licensed under the Apache License, Version 2.0. See LICENSE for the full license text."
>
> "However, for commercial use of Docker Engine obtained via Docker Desktop within larger enterprises (exceeding 250 employees OR with annual revenue surpassing $10 million USD), a paid subscription
is required."
>
> https://docs.docker.com/engine/

## PostgreSQL

> "PostgreSQL is released under the PostgreSQL License, a liberal Open Source license, similar to the BSD or MIT licenses."
>
> https://www.postgresql.org/about/licence/


## pgAdmin

> "pgAdmin 4 is released under the PostgreSQL licence."
>
> https://www.pgadmin.org/licence/


## Chinook-tietokanta

Chinook-tietokannan on luonut [Luis Rocha](https://github.com/lerocha) ja se on lisensoitu [MIT-lisenssillä](https://github.com/lerocha/chinook-database/blob/master/LICENSE.md).


## Tämä oppimateriaali

Tämän tehtävän on kehittänyt Teemu Havulinna ja se on lisensoitu [Creative Commons BY-NC-SA -lisenssillä](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Tehtävänannon, lähdekoodien ja testien toteutuksessa on hyödynnetty ChatGPT-kielimallia sekä GitHub copilot -tekoälyavustinta.

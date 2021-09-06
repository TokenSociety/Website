<?php
function TokenSociety_how_response_content () {
    Q_Response::addStylesheet('css/pages/how.css');

    return Q::view('TokenSociety/content/how.php');
}
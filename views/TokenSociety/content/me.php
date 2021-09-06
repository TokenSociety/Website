<div id="content">

    <!-- Outer container -->
    <div class="layout-container">

        <!-- banner container -->
        <div class="banner-container">
            <div class="banner-block" style="background-image: url(<?php echo $coverUrl ?>)"><button class="Q_button" name="coverPhoto"><?php echo $params["me"]["UploadCoverPhoto"] ?></button></div>
            <?php echo Q::tool("Users/avatar", array(
                'editable' => true,
                "icon" => 200
            ), "me-avatar")?>
        </div>

        <!-- Social icons, quick links -->

        <ul class="header-list-itms">
            <li><button class="Q_button" name="social"><?php echo $params["me"]["LinkSocialAccounts"] ?></button></li>

            <li><?php echo $params["Followers"] ?> <span>0</span></li>
            <li><?php echo $params["Following"] ?> <span>0</span></li>
            <li><a href="#" class="upload"></a></li>
            <li><a href="#" class="dots">...</a></li>
        </ul>
        <div class="profile-block">
            <div class="profile-name">
            <?php echo Q::tool("Users/avatar", array(
                'editable' => true,
                "icon" => false
            ), "me-name")?>
            </div>
            <span class="designation">creator</span> <span class="s-name">@<?php echo Q_Utils::normalize($user->displayName()) ?></span>
            <div class="punchline">
            </div>
        </div>
        <div class="tab-menu-block">
            <a href="#" class="showcase current"><?php echo $params["Showcase"] ?></a>
            <button class="Q_button" name="createCollection"><?php echo $params["me"]["CreateCollection"] ?></button>
            <button class="Q_button" name="becomeCreator"><?php echo $params["me"]["BecomeCreator"] ?></button>
        </div>

        <div class="flex-container">
            <div class="column-3">
                <?php echo Q::tool('TokenSociety/item') ?>
            </div>
        </div>

        <a href="#" class="loadmore"><?php echo $params["LoadMore"] ?></a>
    </div>

    <?php include "snippets/footer.php" ?>

</div>
<div id="content">

    <!-- Outer container -->
        <div class="tokensociety_nft">
            <div class="layout-container">
                <div class="tokensociety_nft_row"> 
                    <div class="tokensociety_nft_col_eight">
                        <div class="tokensociety_nft_image">
                            <?php
							echo Q::tool(array(
								"Streams/preview" => array(
									"publisherId" => $stream->publisherId,
									"streamName" => $stream->name,
									"editable" => true,
									"closeable" => false,
                                    "imagepicker" => array(
                                        "showSize" => $defaultIconSize,
                                        "save" => "NFT/icon",
                                        "saveSizeName" => array(
											$defaultIconSize => $defaultIconSize
                                        )
                                    )
								),
								"NFT/preview" => array()
							), Q_Utils::normalize($stream->publisherId . ' ' . $stream->name));
                            ?>
                        </div>
                    </div>
                    <div class="tokensociety_nft_col_four">
                        <div class="tokensociety_nft_details">
                            <div class="tokensociety_nft_details_header">
                                <div class="tokensociety_nft_details_header_left">
                                    <h2><?php echo Q::tool("Streams/inplace", array(
											"stream" => $stream,
                                            "editable" => $stream->testWriteLevel("edit"),
                                            "inplaceType" => "text",
                                            "field" => "title",
                                            "inplace" => array(
                                                "placeholder" => $texts["NFT"]["TitlePlaceholder"]
                                            )
                                        ), Q_Utils::normalize($stream->name."_title"))?></h2>
                                </div>
                                <div class="tokensociety_nft_details_header_right <?php echo $likes["res"] ? "Q_selected" : "" ?>">
                                    <i class="far fa-heart"></i>
                                    <span><?php echo $likes["likes"]?></span>
                                </div>
                            </div>
                            <span class="tokensociety_nft_span">Auction</span>
                            <p class="tokensociety_nft_art">Art</p>
                            <p><?php echo Q::tool("Streams/inplace", array(
                                    "stream" => $stream,
									"editable" => $stream->testWriteLevel("edit"),
									"inplaceType" => "textarea",
									"field" => "content",
									"inplace" => array(
										"placeholder" => $texts["NFT"]["DescriptionPlaceholder"]
									)
								), Q_Utils::normalize($stream->name."_content"))?></p>
                            <div class="tokensociety_nft_body">
                                <?php if ($author) {?>
                                <div class="tokensociety_nft_body_left">
                                    <span>Author</span>
                                    <div class="tokensociety_nft_body_details">
                                        <img src="../../img/t.png" />
                                        <span class="tokensociety_nft_wallet"><?php echo $author?></span>
                                    </div>
                                </div>
                                <?php } ?>
								<?php if ($owner) {?>
                                    <div class="tokensociety_nft_body_left">
                                        <span>Owner</span>
                                        <div class="tokensociety_nft_body_details">
                                            <img src="../../img/t.png" />
                                            <span class="tokensociety_nft_wallet"><?php echo $owner?></span>
                                        </div>
                                    </div>
								<?php } ?>
                                <?php if (!empty($collections)) { ?>
                                    <div class="tokensociety_nft_body_left">
                                        <span>Collection</span>
                                        <div class="tokensociety_nft_body_collection">
                                        <?php
                                        foreach ($collections as $collection) {
                                            echo "<span>".$collection."</span>";
                                        }
                                        ?>
                                        </div>
                                    </div>
                                <?php } ?>
                            </div>
                            <?php if ($royalty) {?>
                            <p class="tokensociety_nft_buttons"><?php echo $royalty ?>% <?php echo $texts["NFT"]["SalesCreator"] ?></p>
                            <?php } ?>
                            <div class="tokensociety_nft_tabs">
                                <ul>
                                    <li id="details" class="tablinks active"><?php echo $texts["NFT"]["Details"] ?></li>
                                    <li id="bids" class="tablinks"><?php echo $texts["NFT"]["Bids"] ?></li>
                                    <li id="history" class="tablinks"><?php echo $texts["NFT"]["History"] ?></li>
                                </ul>
                            </div>
                            <div class="tabcontent details active-content">
                            <h3><?php echo $texts["NFT"]["Details"] ?></h3>
                            <p> <?php echo $texts["NFT"]["LoremIpsum"] ?> </p>
                          </div>
                          
                          <div class="tabcontent bids">
                            <h3><?php echo $texts["NFT"]["Bids"] ?></h3>
                            <p><?php echo $texts["NFT"]["LoremIpsum"] ?> </p>
                          </div>
                          
                          <div class="tabcontent history">
                            <h3><?php echo $texts["NFT"]["History"] ?></h3>
                            <p><?php echo $texts["NFT"]["LoremIpsum"] ?> </p>
                          </div>
                            <div class="tokensociety_nft_footer">
                                <a class="tokensociety_nft_sale"><?php echo $texts["NFT"]["PutOnSale"] ?></a>
                                <a class="tokensociety_nft_transfer"><?php echo $texts["NFT"]["Transfer"] ?></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>

    <?php include "snippets/footer.php" ?>
</div>
